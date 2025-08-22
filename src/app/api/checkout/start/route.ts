import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rankDishes } from '@/lib/ranker/rankDishes'
import { analytics } from '@/lib/analytics'

interface CheckoutStartRequest {
  restaurantId: string
  dishId?: string
  userId?: string // Optional for personalization
}

interface UserProfile {
  diet_tags: string[]
  allergy_tags: string[]
  cuisines: Record<string, number>
  spice: number
  sweet_savory: number
  herby_umami: number
  crunchy_soft: number
  budget: string
  goals: string[]
  excludes: string[]
}

interface DishData {
  id: string
  name: string
  cuisine: string
  diet_tags: string[]
  allergens: string[]
  spice: number
  macros: {
    kcal: number
    protein: number
    carbs: number
    fat: number
  }
  taste: {
    sweet_savory: number
    herby_umami: number
    crunchy_soft: number
  }
  url: string
  image_url: string
  restaurant_id: string
  platform: string
  price_cents: number
}

/**
 * Generate platform-specific deeplink placeholder if dish.url is not available
 */
function generatePlatformDeeplink(platform: string, restaurantId: string, dishId?: string): string {
  const baseUrls = {
    ubereats: 'https://www.ubereats.com',
    doordash: 'https://www.doordash.com',
    postmates: 'https://postmates.com',
    grubhub: 'https://www.grubhub.com'
  }

  const baseUrl = baseUrls[platform as keyof typeof baseUrls] || baseUrls.ubereats
  
  if (dishId) {
    return `${baseUrl}/store/${restaurantId}/item/${dishId}`
  } else {
    return `${baseUrl}/store/${restaurantId}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, dishId, userId }: CheckoutStartRequest = await request.json()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId is required' },
        { status: 400 }
      )
    }

    // Get restaurant details
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    let selectedDish: DishData | null = null

    if (dishId) {
      // Get specific dish
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', dishId)
        .eq('restaurant_id', restaurantId)
        .single()

      if (dishError || !dish) {
        return NextResponse.json(
          { error: 'Dish not found at this restaurant' },
          { status: 404 }
        )
      }

      selectedDish = dish as DishData
    } else {
      // Find top dish for user at this restaurant
      const { data: dishes, error: dishesError } = await supabase
        .from('dishes')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (dishesError || !dishes || dishes.length === 0) {
        return NextResponse.json(
          { error: 'No dishes found at this restaurant' },
          { status: 404 }
        )
      }

      if (userId) {
        // Get user profile for personalized ranking
        let userProfile: UserProfile | null = null
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          if (profileData) {
            userProfile = {
              diet_tags: profileData.diet_tags || [],
              allergy_tags: profileData.allergy_tags || [],
              cuisines: profileData.cuisines || {},
              spice: profileData.spice || 0,
              sweet_savory: profileData.sweet_savory || 0.5,
              herby_umami: profileData.herby_umami || 0.5,
              crunchy_soft: profileData.crunchy_soft || 0.5,
              budget: profileData.budget || '$$',
              goals: profileData.goals || [],
              excludes: profileData.excludes || []
            }
          }
        } catch {
          // Use default profile if user profile not found
        }

        if (userProfile) {
          // Use ranking system to find best dish
          const dishesForRanking = dishes.map(dish => ({
            id: dish.id,
            name: dish.name,
            cuisine: dish.cuisine,
            diet_tags: dish.diet_tags || [],
            allergens: dish.allergens || [],
            spice: dish.spice || 0,
            macros: dish.macros || { kcal: 0, protein: 0, carbs: 0, fat: 0 },
            taste: dish.taste || { sweet_savory: 0.5, herby_umami: 0.5, crunchy_soft: 0.5 },
            url: dish.url || '',
            image_url: dish.image_url || ''
          }))

          const rankedDishes = rankDishes(userProfile, dishesForRanking)
          
          if (rankedDishes.length > 0) {
            // Find the full dish data for the top ranked dish
            selectedDish = dishes.find(d => d.id === rankedDishes[0].id) as DishData
          }
        }
      }

      // Fallback: select first dish if no personalization or ranking failed
      if (!selectedDish) {
        selectedDish = dishes[0] as DishData
      }
    }

    if (!selectedDish) {
      return NextResponse.json(
        { error: 'No suitable dish found' },
        { status: 404 }
      )
    }

    // Generate deeplink
    const deeplink = selectedDish.url || generatePlatformDeeplink(
      restaurant.platform,
      restaurant.platform_restaurant_id,
      selectedDish.id
    )

    // Track analytics
    analytics.track('checkout_started', {
      restaurantId,
      dishId: selectedDish.id,
      platform: restaurant.platform,
      userId: userId || 'anonymous',
      was_dish_specified: !!dishId,
      dish_name: selectedDish.name,
      restaurant_name: restaurant.name
    })

    return NextResponse.json({
      platform: restaurant.platform,
      deeplink,
      dish: {
        id: selectedDish.id,
        name: selectedDish.name,
        price_cents: selectedDish.price_cents
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        platform: restaurant.platform
      }
    })

  } catch (error) {
    console.error('Checkout start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

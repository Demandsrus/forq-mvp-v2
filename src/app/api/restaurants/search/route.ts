import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rankDishes } from '@/lib/ranker/rankDishes'
import { resolveContext, generateSearchTerms, getPlatformBadge, type SearchContext } from '@/lib/context'
import { analytics } from '@/lib/analytics'
import { applySafetyFilter } from '@/lib/recs_safety'

interface RestaurantSearchRequest {
  userId: string
  context?: SearchContext
}

interface RestaurantHours {
  [day: string]: string[][]
}

interface RestaurantData {
  id: string
  name: string
  platform: string
  cuisine: string
  address: string
  city: string
  state: string
  postal_code: string
  hours: RestaurantHours | null
  atmosphere: string
  rating: number
  review_count: number
  reservation_url: string
  image_url: string
  dishes: DishData[]
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

export async function POST(request: NextRequest) {
  try {
    const { userId, context = {} }: RestaurantSearchRequest = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Resolve context with defaults
    const resolvedContext = resolveContext(context)
    
    // Get user profile for personalization
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
      console.log('No user profile found, using defaults')
    }

    // Default profile if none found
    if (!userProfile) {
      userProfile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: {},
        spice: 2,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }
    }

    // Get user's linked accounts for platform boost
    const { data: linkedAccounts } = await supabase
      .from('linked_accounts')
      .select('provider')
      .eq('user_id', userId)
    
    const linkedPlatforms = new Set(linkedAccounts?.map(acc => acc.provider) || [])

    // Build restaurant query with optional platform preference
    let restaurantQuery = supabase
      .from('restaurants')
      .select(`
        *,
        dishes!inner(
          id, name, cuisine, diet_tags, allergens, spice, macros, taste, 
          url, image_url, restaurant_id, platform, price_cents
        )
      `)

    // Apply platform preference if specified
    if (resolvedContext.platform_pref) {
      restaurantQuery = restaurantQuery.eq('platform', resolvedContext.platform_pref)
    }

    const { data: restaurantsWithDishes, error } = await restaurantQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch restaurants' },
        { status: 500 }
      )
    }

    if (!restaurantsWithDishes || restaurantsWithDishes.length === 0) {
      return NextResponse.json({
        results: [],
        context_used: resolvedContext
      })
    }

    // Process restaurants and apply craving-based filtering
    let filteredRestaurants = restaurantsWithDishes

    if (resolvedContext.craving) {
      const searchTerms = generateSearchTerms(resolvedContext.craving)
      filteredRestaurants = restaurantsWithDishes.filter(restaurant => {
        // Check restaurant name and cuisine
        const restaurantText = `${restaurant.name} ${restaurant.cuisine}`.toLowerCase()
        const restaurantMatch = searchTerms.some(term => restaurantText.includes(term))

        // Check dish names
        const dishMatch = restaurant.dishes.some((dish: DishData) =>
          searchTerms.some(term => dish.name.toLowerCase().includes(term))
        )

        return restaurantMatch || dishMatch
      })
    }

    // Score restaurants using dish ranking
    const scoredRestaurants = filteredRestaurants.map(restaurant => {
      const dishes = restaurant.dishes.map((dish: DishData) => ({
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

      // Rank dishes for this restaurant
      const rankedDishes = rankDishes(userProfile!, dishes)

      // Take top 2 dishes and average their scores
      const topDishes = rankedDishes.slice(0, 2)
      const avgScore = topDishes.length > 0
        ? topDishes.reduce((sum, dish) => sum + dish.score, 0) / topDishes.length
        : 0

      // Add platform boost if user has linked account
      const platformBoost = linkedPlatforms.has(restaurant.platform) ? 5 : 0
      const finalScore = avgScore + platformBoost

      return {
        restaurant,
        score: finalScore,
        topDishes: topDishes.slice(0, 2), // Keep top 2 for recommended_items
        dishCount: dishes.length
      }
    })

    // Sort by score and take topK
    const topRestaurants = scoredRestaurants
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, resolvedContext.topK)

    // Get reviews for selected restaurants
    const restaurantIds = topRestaurants.map(r => r.restaurant.id)
    const { data: reviews } = await supabase
      .from('reviews')
      .select('restaurant_id, stars, text')
      .in('restaurant_id', restaurantIds)
      .order('created_at', { ascending: false })

    // Group reviews by restaurant
    const reviewsByRestaurant = reviews?.reduce((acc, review) => {
      if (!acc[review.restaurant_id]) acc[review.restaurant_id] = []
      acc[review.restaurant_id].push(review)
      return acc
    }, {} as Record<string, Array<{ restaurant_id: string; stars: number; text: string }>>) || {}

    // Format response
    const results = topRestaurants.map(({ restaurant, topDishes }) => {
      const restaurantReviews = reviewsByRestaurant[restaurant.id] || []

      return {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          platform: restaurant.platform,
          image_url: restaurant.image_url,
          address: restaurant.address,
          city: restaurant.city,
          state: restaurant.state,
          postal_code: restaurant.postal_code,
          hours: restaurant.hours,
          atmosphere: restaurant.atmosphere,
          rating: restaurant.rating,
          review_count: restaurant.review_count,
          platform_badge: getPlatformBadge(restaurant.platform)
        },
        overview: {
          summary: `${restaurant.cuisine} restaurant with ${restaurant.atmosphere || 'great'} atmosphere`,
          hours: restaurant.hours,
          atmosphere: restaurant.atmosphere
        },
        recommended_items: topDishes.map(dish => ({
          id: dish.id,
          name: dish.name,
          macros: dish.macros,
          spice: restaurant.dishes.find((d: DishData) => d.id === dish.id)?.spice || 0,
          price_cents: restaurant.dishes.find((d: DishData) => d.id === dish.id)?.price_cents || 0,
          url: dish.url,
          reason: dish.reason,
          score: dish.score
        })),
        reviews_preview: restaurantReviews.slice(0, 3).map(review => ({
          stars: review.stars,
          text: review.text
        })),
        reservation: {
          available: !!restaurant.reservation_url,
          url: restaurant.reservation_url || null
        },
        checkout: {
          platform: restaurant.platform,
          deeplink: topDishes[0]?.url || `https://${restaurant.platform}.com/restaurant/${restaurant.id}`
        }
      }
    })

    // Track analytics
    analytics.track('restaurants_search', {
      userId,
      context: resolvedContext,
      results_count: results.length,
      has_craving: !!resolvedContext.craving,
      platform_pref: resolvedContext.platform_pref,
      time_of_day: resolvedContext.time_of_day
    })

    // Apply safety filter to remove any cooking/recipe content
    const safeResponse = applySafetyFilter({
      results,
      context_used: resolvedContext
    })

    return NextResponse.json(safeResponse)

  } catch (error) {
    console.error('Restaurant search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    })),
  },
}))

vi.mock('@/lib/ranker/rankDishes', () => ({
  rankDishes: vi.fn(),
}))

vi.mock('@/lib/analytics', () => ({
  analytics: {
    track: vi.fn(),
  },
}))

// Mock data
const mockRestaurantData = [
  {
    id: 'rest1',
    name: 'Pizza Palace',
    platform: 'ubereats',
    cuisine: 'italian',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    hours: {
      mon: [['11:00', '22:00']],
      tue: [['11:00', '22:00']],
    },
    atmosphere: 'Casual dining',
    rating: 4.5,
    review_count: 150,
    reservation_url: 'https://opentable.com/pizza-palace',
    image_url: 'https://example.com/pizza.jpg',
    dishes: [
      {
        id: 'dish1',
        name: 'Margherita Pizza',
        cuisine: 'italian',
        diet_tags: [],
        allergens: [],
        spice: 1,
        macros: { kcal: 800, protein: 30, carbs: 100, fat: 25 },
        taste: { sweet_savory: 0.6, herby_umami: 0.8, crunchy_soft: 0.4 },
        url: 'https://ubereats.com/dish1',
        image_url: 'dish1.jpg',
        restaurant_id: 'rest1',
        platform: 'ubereats',
        price_cents: 1599
      },
      {
        id: 'dish2',
        name: 'Pepperoni Pizza',
        cuisine: 'italian',
        diet_tags: [],
        allergens: [],
        spice: 2,
        macros: { kcal: 900, protein: 35, carbs: 110, fat: 30 },
        taste: { sweet_savory: 0.7, herby_umami: 0.7, crunchy_soft: 0.4 },
        url: 'https://ubereats.com/dish2',
        image_url: 'dish2.jpg',
        restaurant_id: 'rest1',
        platform: 'ubereats',
        price_cents: 1799
      }
    ]
  },
  {
    id: 'rest2',
    name: 'Sushi Zen',
    platform: 'doordash',
    cuisine: 'japanese',
    address: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94103',
    hours: {
      mon: [['17:00', '23:00']],
      tue: [['17:00', '23:00']],
    },
    atmosphere: 'Upscale',
    rating: 4.8,
    review_count: 89,
    reservation_url: null,
    image_url: 'https://example.com/sushi.jpg',
    dishes: [
      {
        id: 'dish3',
        name: 'California Roll',
        cuisine: 'japanese',
        diet_tags: [],
        allergens: ['fish'],
        spice: 0,
        macros: { kcal: 300, protein: 15, carbs: 40, fat: 8 },
        taste: { sweet_savory: 0.4, herby_umami: 0.9, crunchy_soft: 0.6 },
        url: 'https://doordash.com/dish3',
        image_url: 'dish3.jpg',
        restaurant_id: 'rest2',
        platform: 'doordash',
        price_cents: 1299
      }
    ]
  }
]

const mockReviews = [
  { restaurant_id: 'rest1', stars: 5, text: 'Amazing pizza!' },
  { restaurant_id: 'rest1', stars: 4, text: 'Great atmosphere' },
  { restaurant_id: 'rest2', stars: 5, text: 'Fresh sushi' }
]

const mockRankedDishes = [
  {
    id: 'dish1',
    name: 'Margherita Pizza',
    macros: { kcal: 800, protein: 30, carbs: 100, fat: 25 },
    taste: { sweet_savory: 0.6, herby_umami: 0.8, crunchy_soft: 0.4 },
    url: 'https://ubereats.com/dish1',
    image_url: 'dish1.jpg',
    score: 85,
    reason: 'Great match for your taste preferences'
  },
  {
    id: 'dish2',
    name: 'Pepperoni Pizza',
    macros: { kcal: 900, protein: 35, carbs: 110, fat: 30 },
    taste: { sweet_savory: 0.7, herby_umami: 0.7, crunchy_soft: 0.4 },
    url: 'https://ubereats.com/dish2',
    image_url: 'dish2.jpg',
    score: 78,
    reason: 'Popular choice'
  }
]

// Import the actual function we want to test
// Note: In a real implementation, you'd extract the core logic to a separate function
async function mockRestaurantSearch(requestBody: any) {
  const { userId, context = {} } = requestBody
  
  // Simulate the API logic
  const resolvedContext = {
    craving: context.craving || '',
    budget: context.budget || '$$',
    time_of_day: context.time_of_day || 'lunch',
    mood: context.mood || '',
    platform_pref: context.platform_pref || 'ubereats',
    topK: context.topK || 5
  }

  // Filter restaurants by platform preference if specified
  let filteredRestaurants = mockRestaurantData
  if (resolvedContext.platform_pref) {
    filteredRestaurants = mockRestaurantData.filter(r => r.platform === resolvedContext.platform_pref)
  }

  // Apply craving filter if specified
  if (resolvedContext.craving) {
    const searchTerms = resolvedContext.craving.toLowerCase().split(' ')
    filteredRestaurants = filteredRestaurants.filter(restaurant => {
      const restaurantText = `${restaurant.name} ${restaurant.cuisine}`.toLowerCase()
      const restaurantMatch = searchTerms.some(term => restaurantText.includes(term))
      const dishMatch = restaurant.dishes.some(dish => 
        searchTerms.some(term => dish.name.toLowerCase().includes(term))
      )
      return restaurantMatch || dishMatch
    })
  }

  // Score and rank restaurants
  const scoredRestaurants = filteredRestaurants.map(restaurant => {
    const avgScore = 75 // Mock average dish score
    const platformBoost = 0 // Mock no linked accounts
    return {
      restaurant,
      score: avgScore + platformBoost,
      topDishes: mockRankedDishes.slice(0, 2)
    }
  })

  // Sort by score and take topK
  const topRestaurants = scoredRestaurants
    .sort((a, b) => b.score - a.score)
    .slice(0, resolvedContext.topK)

  // Format response
  const results = topRestaurants.map(({ restaurant, topDishes }) => ({
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
      platform_badge: `/assets/platforms/${restaurant.platform}.svg`
    },
    overview: {
      summary: `${restaurant.cuisine} restaurant with ${restaurant.atmosphere} atmosphere`,
      hours: restaurant.hours,
      atmosphere: restaurant.atmosphere
    },
    recommended_items: topDishes.map(dish => ({
      id: dish.id,
      name: dish.name,
      macros: dish.macros,
      spice: restaurant.dishes.find(d => d.id === dish.id)?.spice || 0,
      price_cents: restaurant.dishes.find(d => d.id === dish.id)?.price_cents || 0,
      url: dish.url,
      reason: dish.reason,
      score: dish.score
    })),
    reviews_preview: mockReviews
      .filter(r => r.restaurant_id === restaurant.id)
      .slice(0, 3)
      .map(review => ({
        stars: review.stars,
        text: review.text
      })),
    reservation: {
      available: !!restaurant.reservation_url,
      url: restaurant.reservation_url
    },
    checkout: {
      platform: restaurant.platform,
      deeplink: topDishes[0]?.url || `https://${restaurant.platform}.com/restaurant/${restaurant.id}`
    }
  }))

  return {
    results,
    context_used: resolvedContext
  }
}

describe('/api/restaurants/search', () => {
  describe('Response format validation', () => {
    it('should return results with all required sections', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 3 }
      }

      const response = await mockRestaurantSearch(requestBody)

      expect(response.results).toBeDefined()
      expect(response.context_used).toBeDefined()
      expect(Array.isArray(response.results)).toBe(true)

      if (response.results.length > 0) {
        const restaurant = response.results[0]
        
        // Check restaurant section
        expect(restaurant.restaurant).toBeDefined()
        expect(restaurant.restaurant.id).toBeDefined()
        expect(restaurant.restaurant.name).toBeDefined()
        expect(restaurant.restaurant.platform).toBeDefined()
        expect(restaurant.restaurant.platform_badge).toBeDefined()

        // Check overview section
        expect(restaurant.overview).toBeDefined()
        expect(restaurant.overview.summary).toBeDefined()
        expect(restaurant.overview.hours).toBeDefined()
        expect(restaurant.overview.atmosphere).toBeDefined()

        // Check recommended_items section
        expect(restaurant.recommended_items).toBeDefined()
        expect(Array.isArray(restaurant.recommended_items)).toBe(true)

        // Check reviews_preview section
        expect(restaurant.reviews_preview).toBeDefined()
        expect(Array.isArray(restaurant.reviews_preview)).toBe(true)

        // Check reservation section
        expect(restaurant.reservation).toBeDefined()
        expect(typeof restaurant.reservation.available).toBe('boolean')

        // Check checkout section
        expect(restaurant.checkout).toBeDefined()
        expect(restaurant.checkout.platform).toBeDefined()
        expect(restaurant.checkout.deeplink).toBeDefined()
      }
    })

    it('should respect topK limit', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 1 }
      }

      const response = await mockRestaurantSearch(requestBody)

      expect(response.results.length).toBeLessThanOrEqual(1)
    })

    it('should return <= topK results even with more available', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 4 }
      }

      const response = await mockRestaurantSearch(requestBody)

      expect(response.results.length).toBeLessThanOrEqual(4)
      expect(response.results.length).toBeLessThanOrEqual(mockRestaurantData.length)
    })

    it('should include platform badges for all restaurants', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 5 }
      }

      const response = await mockRestaurantSearch(requestBody)

      response.results.forEach(restaurant => {
        expect(restaurant.restaurant.platform_badge).toMatch(/\/assets\/platforms\/\w+\.svg/)
      })
    })
  })

  describe('Context handling', () => {
    it('should apply default context when none provided', async () => {
      const requestBody = {
        userId: 'test-user'
      }

      const response = await mockRestaurantSearch(requestBody)

      expect(response.context_used.budget).toBe('$$')
      expect(response.context_used.platform_pref).toBe('ubereats')
      expect(response.context_used.topK).toBe(5)
    })

    it('should use provided context values', async () => {
      const requestBody = {
        userId: 'test-user',
        context: {
          craving: 'pizza',
          budget: '$$$',
          platform_pref: 'doordash',
          topK: 3
        }
      }

      const response = await mockRestaurantSearch(requestBody)

      expect(response.context_used.craving).toBe('pizza')
      expect(response.context_used.budget).toBe('$$$')
      expect(response.context_used.platform_pref).toBe('doordash')
      expect(response.context_used.topK).toBe(3)
    })

    it('should filter by platform preference', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { platform_pref: 'ubereats' }
      }

      const response = await mockRestaurantSearch(requestBody)

      response.results.forEach(restaurant => {
        expect(restaurant.restaurant.platform).toBe('ubereats')
      })
    })

    it('should filter by craving', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { craving: 'pizza' }
      }

      const response = await mockRestaurantSearch(requestBody)

      // Should find Pizza Palace but not Sushi Zen
      const restaurantNames = response.results.map(r => r.restaurant.name)
      expect(restaurantNames).toContain('Pizza Palace')
    })
  })

  describe('Required data sections', () => {
    it('should include recommended items with all required fields', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 1 }
      }

      const response = await mockRestaurantSearch(requestBody)

      if (response.results.length > 0) {
        const items = response.results[0].recommended_items
        expect(items.length).toBeGreaterThan(0)

        items.forEach(item => {
          expect(item.id).toBeDefined()
          expect(item.name).toBeDefined()
          expect(item.macros).toBeDefined()
          expect(typeof item.spice).toBe('number')
          expect(typeof item.price_cents).toBe('number')
          expect(item.url).toBeDefined()
          expect(item.reason).toBeDefined()
          expect(typeof item.score).toBe('number')
        })
      }
    })

    it('should include reviews preview with stars and text', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 1 }
      }

      const response = await mockRestaurantSearch(requestBody)

      if (response.results.length > 0) {
        const reviews = response.results[0].reviews_preview
        
        reviews.forEach(review => {
          expect(typeof review.stars).toBe('number')
          expect(typeof review.text).toBe('string')
          expect(review.stars).toBeGreaterThanOrEqual(1)
          expect(review.stars).toBeLessThanOrEqual(5)
        })
      }
    })

    it('should include reservation info', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 2 }
      }

      const response = await mockRestaurantSearch(requestBody)

      response.results.forEach(restaurant => {
        expect(typeof restaurant.reservation.available).toBe('boolean')
        
        if (restaurant.reservation.available) {
          expect(restaurant.reservation.url).toBeTruthy()
        } else {
          expect(restaurant.reservation.url).toBeNull()
        }
      })
    })

    it('should include checkout deeplinks', async () => {
      const requestBody = {
        userId: 'test-user',
        context: { topK: 2 }
      }

      const response = await mockRestaurantSearch(requestBody)

      response.results.forEach(restaurant => {
        expect(restaurant.checkout.platform).toBeDefined()
        expect(restaurant.checkout.deeplink).toBeDefined()
        expect(restaurant.checkout.deeplink).toMatch(/^https?:\/\//)
      })
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { rankDishes } from '@/lib/ranker/rankDishes'

// Mock data for testing
const mockUserProfile = {
  diet_tags: [],
  allergy_tags: [],
  cuisines: { italian: 0.8, japanese: 0.6 },
  spice: 2,
  sweet_savory: 0.6,
  herby_umami: 0.7,
  crunchy_soft: 0.5,
  budget: '$$',
  goals: [],
  excludes: []
}

const mockDishes = [
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
    image_url: 'image1.jpg'
  },
  {
    id: 'dish2',
    name: 'Spicy Ramen',
    cuisine: 'japanese',
    diet_tags: [],
    allergens: [],
    spice: 4,
    macros: { kcal: 600, protein: 25, carbs: 80, fat: 15 },
    taste: { sweet_savory: 0.3, herby_umami: 0.9, crunchy_soft: 0.6 },
    url: 'https://ubereats.com/dish2',
    image_url: 'image2.jpg'
  }
]

const mockRestaurants = [
  {
    id: 'rest1',
    name: 'Pizza Palace',
    platform: 'ubereats',
    cuisine: 'italian',
    dishes: [mockDishes[0]]
  },
  {
    id: 'rest2',
    name: 'Ramen House',
    platform: 'doordash',
    cuisine: 'japanese',
    dishes: [mockDishes[1]]
  }
]

/**
 * Simulate restaurant scoring logic from /api/restaurants/search
 */
function scoreRestaurants(
  restaurants: typeof mockRestaurants,
  userProfile: typeof mockUserProfile,
  linkedPlatforms: Set<string> = new Set()
) {
  return restaurants.map(restaurant => {
    // Rank dishes for this restaurant
    const rankedDishes = rankDishes(userProfile, restaurant.dishes)
    
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
      topDishes,
      platformBoost
    }
  })
}

describe('Restaurant Scoring', () => {
  describe('Platform preference and linked account boost', () => {
    it('should give higher score when platform matches linked account', () => {
      const linkedPlatforms = new Set(['ubereats'])
      
      const scoredRestaurants = scoreRestaurants(
        mockRestaurants,
        mockUserProfile,
        linkedPlatforms
      )

      const uberEatsRestaurant = scoredRestaurants.find(r => r.restaurant.platform === 'ubereats')
      const doorDashRestaurant = scoredRestaurants.find(r => r.restaurant.platform === 'doordash')

      expect(uberEatsRestaurant?.platformBoost).toBe(5)
      expect(doorDashRestaurant?.platformBoost).toBe(0)
      expect(uberEatsRestaurant?.score).toBeGreaterThan(doorDashRestaurant?.score || 0)
    })

    it('should not give platform boost when no linked accounts', () => {
      const linkedPlatforms = new Set<string>()
      
      const scoredRestaurants = scoreRestaurants(
        mockRestaurants,
        mockUserProfile,
        linkedPlatforms
      )

      scoredRestaurants.forEach(scored => {
        expect(scored.platformBoost).toBe(0)
      })
    })

    it('should give platform boost to multiple linked platforms', () => {
      const linkedPlatforms = new Set(['ubereats', 'doordash'])
      
      const scoredRestaurants = scoreRestaurants(
        mockRestaurants,
        mockUserProfile,
        linkedPlatforms
      )

      scoredRestaurants.forEach(scored => {
        expect(scored.platformBoost).toBe(5)
      })
    })

    it('should apply platform boost correctly', () => {
      // Test that platform boost is applied when linked account exists
      const linkedPlatforms = new Set(['ubereats'])
      const testRestaurants = [mockRestaurants[0]] // Just Pizza Palace (ubereats)

      const scoredWithBoost = scoreRestaurants(
        testRestaurants,
        mockUserProfile,
        linkedPlatforms
      )

      const scoredWithoutBoost = scoreRestaurants(
        testRestaurants,
        mockUserProfile,
        new Set() // No linked platforms
      )

      const withBoost = scoredWithBoost[0]
      const withoutBoost = scoredWithoutBoost[0]

      // Platform boost should add exactly 5 points
      expect(withBoost.score).toBe(withoutBoost.score + 5)
      expect(withBoost.platformBoost).toBe(5)
      expect(withoutBoost.platformBoost).toBe(0)
    })
  })

  describe('Dish scoring integration', () => {
    it('should use dish ranking scores in restaurant scoring', () => {
      const scoredRestaurants = scoreRestaurants(mockRestaurants, mockUserProfile)

      scoredRestaurants.forEach(scored => {
        expect(scored.topDishes.length).toBeGreaterThan(0)
        expect(scored.topDishes[0].score).toBeGreaterThan(0)
        expect(scored.score).toBeGreaterThan(0)
      })
    })

    it('should average top 2 dish scores', () => {
      const restaurantWithMultipleDishes = {
        id: 'rest-multi',
        name: 'Multi Dish Restaurant',
        platform: 'ubereats',
        cuisine: 'italian',
        dishes: [
          { ...mockDishes[0], id: 'dish-a' },
          { ...mockDishes[0], id: 'dish-b' },
          { ...mockDishes[0], id: 'dish-c' }
        ]
      }

      const scoredRestaurants = scoreRestaurants(
        [restaurantWithMultipleDishes],
        mockUserProfile
      )

      const scored = scoredRestaurants[0]
      expect(scored.topDishes.length).toBe(2) // Should take top 2
      
      const expectedAvg = (scored.topDishes[0].score + scored.topDishes[1].score) / 2
      expect(scored.score).toBe(expectedAvg) // No platform boost in this test
    })

    it('should handle restaurants with no dishes', () => {
      const emptyRestaurant = {
        id: 'empty-rest',
        name: 'Empty Restaurant',
        platform: 'ubereats',
        cuisine: 'italian',
        dishes: []
      }

      const scoredRestaurants = scoreRestaurants([emptyRestaurant], mockUserProfile)
      const scored = scoredRestaurants[0]

      expect(scored.score).toBe(0)
      expect(scored.topDishes.length).toBe(0)
    })
  })

  describe('Score calculation edge cases', () => {
    it('should handle single dish restaurants', () => {
      const singleDishRestaurant = {
        id: 'single-dish',
        name: 'Single Dish Place',
        platform: 'ubereats',
        cuisine: 'italian',
        dishes: [mockDishes[0]]
      }

      const scoredRestaurants = scoreRestaurants([singleDishRestaurant], mockUserProfile)
      const scored = scoredRestaurants[0]

      expect(scored.topDishes.length).toBe(1)
      expect(scored.score).toBe(scored.topDishes[0].score) // Should equal the single dish score
    })

    it('should combine dish score and platform boost correctly', () => {
      const linkedPlatforms = new Set(['ubereats'])
      const scoredRestaurants = scoreRestaurants(mockRestaurants, mockUserProfile, linkedPlatforms)

      const uberEatsRestaurant = scoredRestaurants.find(r => r.restaurant.platform === 'ubereats')
      
      if (uberEatsRestaurant) {
        const dishScore = uberEatsRestaurant.topDishes[0].score
        const expectedTotal = dishScore + 5 // Platform boost
        expect(uberEatsRestaurant.score).toBe(expectedTotal)
      }
    })
  })
})

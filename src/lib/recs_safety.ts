/**
 * Safety middleware for filtering out cooking/recipe content from recommendations
 */

import { containsCookingTerms, containsCookingUrl } from './guardrails'

interface DishItem {
  id: string
  name: string
  url?: string
  [key: string]: any
}

interface RestaurantWithItems {
  recommended_items?: DishItem[]
  [key: string]: any
}

/**
 * Filter out cooking or recipe-related items from a list
 */
export function filterOutCookingOrRecipe<T extends DishItem>(items: T[]): T[] {
  return items.filter(item => {
    // Check item name for cooking terms
    if (containsCookingTerms(item.name)) {
      console.log(`Filtered out item with cooking terms in name: ${item.name}`)
      return false
    }

    // Check URL for cooking/recipe sites
    if (item.url && containsCookingUrl(item.url)) {
      console.log(`Filtered out item with cooking URL: ${item.url}`)
      return false
    }

    return true
  })
}

/**
 * Filter cooking/recipe content from restaurant payloads
 */
export function filterRestaurantRecommendations<T extends RestaurantWithItems>(restaurants: T[]): T[] {
  return restaurants.map(restaurant => {
    if (restaurant.recommended_items) {
      return {
        ...restaurant,
        recommended_items: filterOutCookingOrRecipe(restaurant.recommended_items)
      }
    }
    return restaurant
  })
}

/**
 * Filter cooking/recipe content from flat dish arrays
 */
export function filterDishRecommendations<T extends DishItem>(dishes: T[]): T[] {
  return filterOutCookingOrRecipe(dishes)
}

/**
 * Comprehensive safety filter for any recommendation response
 */
export function applySafetyFilter(data: any): any {
  if (!data) return data

  // Handle restaurant search results
  if (data.results && Array.isArray(data.results)) {
    return {
      ...data,
      results: filterRestaurantRecommendations(data.results)
    }
  }

  // Handle flat dish arrays (legacy recs format)
  if (data.dishes && Array.isArray(data.dishes)) {
    return {
      ...data,
      dishes: filterDishRecommendations(data.dishes)
    }
  }

  // Handle recipes array (legacy format)
  if (data.recipes && Array.isArray(data.recipes)) {
    return {
      ...data,
      recipes: filterDishRecommendations(data.recipes)
    }
  }

  // Handle recommendations array (legacy format)
  if (data.recommendations && Array.isArray(data.recommendations)) {
    return {
      ...data,
      recommendations: filterDishRecommendations(data.recommendations)
    }
  }

  // Handle restaurant-specific recommendations
  if (data.recommended_items && Array.isArray(data.recommended_items)) {
    return {
      ...data,
      recommended_items: filterOutCookingOrRecipe(data.recommended_items)
    }
  }

  return data
}

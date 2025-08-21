/**
 * Example usage of the new database types and schemas
 * This file demonstrates how to use the Zod schemas and TypeScript types
 */

import { supabase } from '@/lib/supabase'
import { 
  ProfileInsertSchema, 
  DishInsertSchema, 
  FavoriteInsertSchema,
  validateProfile,
  validateDish,
  type Profile,
  type Dish,
  type Favorite
} from '../types/db'

// =============================================================================
// EXAMPLE: Creating a user profile
// =============================================================================

async function createUserProfile(userId: string) {
  // Validate data with Zod before inserting
  const profileData = ProfileInsertSchema.parse({
    user_id: userId,
    diet_tags: ['vegetarian', 'gluten_free'],
    allergy_tags: ['nuts', 'dairy'],
    cuisines: { 
      italian: 0.9, 
      japanese: 0.7, 
      mexican: 0.5 
    },
    spice: 2,
    sweet_savory: 0.3, // More savory
    herby_umami: 0.8,  // High umami
    crunchy_soft: 0.6, // Slightly crunchy
    budget: '$$',
    goals: ['weight_loss', 'muscle_gain'],
    excludes: ['processed_foods']
  })

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) throw error
  
  // TypeScript knows this is a Profile type
  const profile: Profile = data
  return profile
}

// =============================================================================
// EXAMPLE: Creating a dish
// =============================================================================

async function createDish() {
  // Validate data with Zod before inserting
  const dishData = DishInsertSchema.parse({
    name: 'Spicy Thai Basil Chicken',
    cuisine: 'thai',
    diet_tags: ['high_protein'],
    allergens: ['soy'],
    spice: 4,
    macros: {
      kcal: 520,
      protein: 32,
      carbs: 55,
      fat: 18
    },
    taste: {
      sweet_savory: 0.2,  // More savory
      herby_umami: 0.9,   // Very herby/umami
      crunchy_soft: 0.4   // Slightly soft
    },
    url: 'https://example.com/recipe/thai-basil-chicken',
    image_url: 'https://example.com/images/thai-basil-chicken.jpg'
  })

  const { data, error } = await supabase
    .from('dishes')
    .insert(dishData)
    .select()
    .single()

  if (error) throw error
  
  // TypeScript knows this is a Dish type
  const dish: Dish = data
  return dish
}

// =============================================================================
// EXAMPLE: Adding a favorite
// =============================================================================

async function addFavorite(userId: string, dishId: string) {
  // Validate data with Zod before inserting
  const favoriteData = FavoriteInsertSchema.parse({
    user_id: userId,
    dish_id: dishId
  })

  const { data, error } = await supabase
    .from('favorites')
    .insert(favoriteData)
    .select()
    .single()

  if (error) throw error
  
  // TypeScript knows this is a Favorite type
  const favorite: Favorite = data
  return favorite
}

// =============================================================================
// EXAMPLE: Fetching user's profile with type safety
// =============================================================================

async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No profile found
    throw error
  }

  // Validate the data from database matches our schema
  return validateProfile(data)
}

// =============================================================================
// EXAMPLE: Finding dishes that match user preferences
// =============================================================================

async function getRecommendedDishes(userProfile: Profile): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .lte('spice', userProfile.spice + 1) // Allow slightly spicier
    .order('name')

  if (error) throw error

  // Filter and validate dishes
  return data
    .filter(dish => {
      // Check if user has any allergies that match dish allergens
      const hasAllergen = dish.allergens?.some(allergen => 
        userProfile.allergy_tags.includes(allergen)
      )
      return !hasAllergen
    })
    .map(dish => validateDish(dish))
}

// =============================================================================
// EXAMPLE: Getting user's favorites with dish details
// =============================================================================

async function getUserFavoritesWithDishes(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      dishes (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(favorite => ({
    ...favorite,
    dish: validateDish(favorite.dishes)
  }))
}

export {
  createUserProfile,
  createDish,
  addFavorite,
  getUserProfile,
  getRecommendedDishes,
  getUserFavoritesWithDishes
}

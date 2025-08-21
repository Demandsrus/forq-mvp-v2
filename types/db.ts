import { z } from 'zod'

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

// Profile Schema
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  diet_tags: z.array(z.string()).default([]),
  allergy_tags: z.array(z.string()).default([]),
  cuisines: z.record(z.string(), z.number()).default({}), // {"japanese":0.9,"mexican":0.2}
  spice: z.number().int().min(0).max(5).default(0),
  sweet_savory: z.number().min(0).max(1).default(0.5),
  herby_umami: z.number().min(0).max(1).default(0.5),
  crunchy_soft: z.number().min(0).max(1).default(0.5),
  budget: z.enum(['$', '$$', '$$$', '$$$$']).default('$$'),
  goals: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const ProfileInsertSchema = ProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).partial().extend({
  user_id: z.string().uuid(),
})

export const ProfileUpdateSchema = ProfileSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true
}).partial()

// Dish Schema
export const DishMacrosSchema = z.object({
  kcal: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
}).optional()

export const DishTasteSchema = z.object({
  sweet_savory: z.number().min(0).max(1).optional(),
  herby_umami: z.number().min(0).max(1).optional(),
  crunchy_soft: z.number().min(0).max(1).optional(),
}).optional()

export const DishSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  cuisine: z.string().min(1),
  diet_tags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  spice: z.number().int().min(0).max(5).default(0),
  macros: DishMacrosSchema,
  taste: DishTasteSchema,
  url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  restaurant_id: z.string().uuid().optional().nullable(),
  platform: z.enum(['doordash','ubereats','postmates','grubhub']).optional().nullable(),
  price_cents: z.number().int().optional().nullable(),
})

export const DishInsertSchema = DishSchema.omit({ id: true }).partial().extend({
  name: z.string().min(1),
  cuisine: z.string().min(1),
})

export const DishUpdateSchema = DishSchema.omit({ id: true }).partial()

// Favorites Schema
export const FavoriteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  dish_id: z.string().uuid(),
  created_at: z.string().datetime(),
})

export const FavoriteInsertSchema = FavoriteSchema.omit({ id: true, created_at: true })

// Linked Accounts Schema
export const LinkedAccountSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  provider: z.enum(['doordash','ubereats','postmates','grubhub']),
  external_user_id: z.string(),
  access_token: z.string().optional().nullable(),
  refresh_token: z.string().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime(),
})

export const LinkedAccountInsertSchema = LinkedAccountSchema.omit({ id: true, created_at: true })

// Restaurants Schema
export const RestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  platform: z.enum(['doordash','ubereats','postmates','grubhub']),
  platform_restaurant_id: z.string().min(1),
  cuisine: z.string().min(1),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  hours: z.record(z.any()).optional().nullable(),
  atmosphere: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  review_count: z.number().int().optional().nullable(),
  reservation_url: z.string().url().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
})

export const RestaurantInsertSchema = RestaurantSchema.omit({ id: true })

// Reviews Schema
export const ReviewSchema = z.object({
  id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  text: z.string().optional().nullable(),
  created_at: z.string().datetime(),
})

export const ReviewInsertSchema = ReviewSchema.omit({ id: true, created_at: true })

// =============================================================================
// TYPESCRIPT TYPES
// =============================================================================

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileInsert = z.infer<typeof ProfileInsertSchema>
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>

export type DishMacros = z.infer<typeof DishMacrosSchema>
export type DishTaste = z.infer<typeof DishTasteSchema>
export type Dish = z.infer<typeof DishSchema>
export type DishInsert = z.infer<typeof DishInsertSchema>
export type DishUpdate = z.infer<typeof DishUpdateSchema>

export type Favorite = z.infer<typeof FavoriteSchema>
export type FavoriteInsert = z.infer<typeof FavoriteInsertSchema>

// =============================================================================
// SUPABASE DATABASE TYPE DEFINITIONS
// =============================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      dishes: {
        Row: Dish
        Insert: DishInsert
        Update: DishUpdate
      }
      favorites: {
        Row: Favorite
        Insert: FavoriteInsert
        Update: Partial<FavoriteInsert>
      }
      // Keep existing tables for backward compatibility
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      quiz_responses: {
        Row: {
          id: string
          user_id: string
          responses: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          responses: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          responses?: Record<string, any>
          created_at?: string
        }
      }
      linked_accounts: {
        Row: LinkedAccount
        Insert: LinkedAccountInsert
        Update: Partial<LinkedAccountInsert>
      }
      restaurants: {
        Row: Restaurant
        Insert: RestaurantInsert
        Update: Partial<RestaurantInsert>
      }
      reviews: {
        Row: Review
        Insert: ReviewInsert
        Update: Partial<ReviewInsert>
      }

    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validates profile data against the schema
 */
export function validateProfile(data: unknown): Profile {
  return ProfileSchema.parse(data)
}

/**
 * Validates dish data against the schema
 */
export function validateDish(data: unknown): Dish {
  return DishSchema.parse(data)
}

/**
 * Validates favorite data against the schema
 */
export function validateFavorite(data: unknown): Favorite {
  return FavoriteSchema.parse(data)
}

/**
 * Type guard for checking if data is a valid profile
 */
export function isProfile(data: unknown): data is Profile {
  return ProfileSchema.safeParse(data).success
}

/**
 * Type guard for checking if data is a valid dish
 */
export function isDish(data: unknown): data is Dish {
  return DishSchema.safeParse(data).success
}

/**
 * Type guard for checking if data is a valid favorite
 */
export function isFavorite(data: unknown): data is Favorite {
  return FavoriteSchema.safeParse(data).success
}

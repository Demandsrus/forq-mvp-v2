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

export const FavoriteInsertSchema = FavoriteSchema.omit({ 
  id: true, 
  created_at: true 
})

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

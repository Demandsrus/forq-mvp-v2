# FORQ Database Setup

This document explains how to set up and use the FORQ database with the new table structure.

## 🗃️ Database Schema

The FORQ app uses three main tables:

### 1. **profiles** - User preference profiles
- Stores user dietary preferences, allergies, taste preferences
- Links to Supabase auth users
- Used for personalized recommendations

### 2. **dishes** - Food/recipe database  
- Stores dish information, nutritional data, taste profiles
- Public read access for browsing
- Can link to external recipe URLs

### 3. **favorites** - User favorites
- Links users to their favorite dishes
- Many-to-many relationship between users and dishes

## 🚀 Setup Instructions

### Step 1: Run the Migration

1. **Generate the SQL migration:**
   ```bash
   npm run db:migrate
   ```

2. **Copy the output SQL**

3. **Open your Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to **SQL Editor**

4. **Paste and run the SQL:**
   - Paste the migration SQL
   - Click **Run** to execute

### Step 2: Verify Tables Created

Check that these tables exist in your Supabase dashboard:
- ✅ `profiles`
- ✅ `dishes` 
- ✅ `favorites`

## 📝 Usage Examples

### Import Types and Schemas

```typescript
import { supabase } from '@/lib/supabase'
import { 
  ProfileInsertSchema, 
  DishInsertSchema,
  type Profile,
  type Dish,
  validateProfile 
} from '../types/db'
```

### Create a User Profile

```typescript
const profileData = ProfileInsertSchema.parse({
  user_id: userId,
  diet_tags: ['vegetarian', 'gluten_free'],
  cuisines: { italian: 0.9, japanese: 0.7 },
  spice: 2,
  budget: '$$'
})

const { data } = await supabase
  .from('profiles')
  .insert(profileData)
  .select()
  .single()
```

### Add a Dish

```typescript
const dishData = DishInsertSchema.parse({
  name: 'Spicy Thai Basil Chicken',
  cuisine: 'thai',
  spice: 4,
  macros: { kcal: 520, protein: 32 },
  taste: { sweet_savory: 0.2, herby_umami: 0.9 }
})

const { data } = await supabase
  .from('dishes')
  .insert(dishData)
  .select()
  .single()
```

### Add to Favorites

```typescript
const { data } = await supabase
  .from('favorites')
  .insert({ user_id: userId, dish_id: dishId })
  .select()
  .single()
```

## 🔒 Security (Row Level Security)

The database includes RLS policies:

- **profiles**: Users can only access their own profile
- **dishes**: Public read access for all users  
- **favorites**: Users can only access their own favorites

## 🧪 Type Safety

All database operations are type-safe using:

- **Zod schemas** for runtime validation
- **TypeScript types** for compile-time checking
- **Helper functions** for validation and type guards

See `examples/database-usage.ts` for detailed usage examples.

## 📊 Data Structure Details

### Profile Taste Preferences
- `sweet_savory`: 0.0 = very sweet, 1.0 = very savory
- `herby_umami`: 0.0 = mild herbs, 1.0 = strong umami
- `crunchy_soft`: 0.0 = very soft, 1.0 = very crunchy

### Dish Macros (optional)
```json
{
  "kcal": 520,
  "protein": 32,
  "carbs": 55, 
  "fat": 18
}
```

### Cuisine Preferences (in profiles)
```json
{
  "italian": 0.9,
  "japanese": 0.7,
  "mexican": 0.5
}
```

## 🔄 Migration Script

The `npm run db:migrate` script:
- Prints SQL for manual execution
- Includes table creation, constraints, and RLS policies
- Safe to run multiple times (uses `IF NOT EXISTS`)

## 🛠️ Development

- **Types**: All types are in `types/db.ts`
- **Examples**: See `examples/database-usage.ts`
- **Validation**: Use Zod schemas before database operations
- **Testing**: Mock the supabase client in tests

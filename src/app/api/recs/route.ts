import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Mock recipe database - in production this would come from a real database
const MOCK_RECIPES = [
  {
    id: '1',
    title: 'Spicy Thai Basil Chicken',
    description: 'A quick and flavorful stir-fry with fresh basil and chilies',
    cookTime: '20 mins',
    difficulty: 'Easy',
    cuisine: 'Thai',
    tags: ['Spicy', 'Quick', 'Protein'],
    spiceLevel: 'Hot',
    dietaryRestrictions: [],
    mealType: 'Dinner'
  },
  {
    id: '2',
    title: 'Mediterranean Quinoa Bowl',
    description: 'Healthy bowl with quinoa, vegetables, and tahini dressing',
    cookTime: '25 mins',
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    tags: ['Healthy', 'Vegetarian', 'Bowl'],
    spiceLevel: 'Mild',
    dietaryRestrictions: ['Vegetarian'],
    mealType: 'Lunch'
  },
  {
    id: '3',
    title: 'Classic Margherita Pizza',
    description: 'Homemade pizza with fresh mozzarella and basil',
    cookTime: '45 mins',
    difficulty: 'Medium',
    cuisine: 'Italian',
    tags: ['Vegetarian', 'Comfort Food'],
    spiceLevel: 'Mild',
    dietaryRestrictions: ['Vegetarian'],
    mealType: 'Dinner'
  },
  {
    id: '4',
    title: 'Vegan Buddha Bowl',
    description: 'Colorful bowl with roasted vegetables and tahini sauce',
    cookTime: '30 mins',
    difficulty: 'Easy',
    cuisine: 'American',
    tags: ['Vegan', 'Healthy', 'Bowl'],
    spiceLevel: 'Mild',
    dietaryRestrictions: ['Vegan', 'Vegetarian'],
    mealType: 'Lunch'
  },
  {
    id: '5',
    title: 'Beef Tacos with Salsa',
    description: 'Seasoned ground beef tacos with fresh salsa',
    cookTime: '25 mins',
    difficulty: 'Easy',
    cuisine: 'Mexican',
    tags: ['Protein', 'Quick', 'Comfort Food'],
    spiceLevel: 'Medium',
    dietaryRestrictions: [],
    mealType: 'Dinner'
  },
  {
    id: '6',
    title: 'Chicken Curry',
    description: 'Aromatic Indian curry with tender chicken',
    cookTime: '40 mins',
    difficulty: 'Medium',
    cuisine: 'Indian',
    tags: ['Spicy', 'Protein', 'Comfort Food'],
    spiceLevel: 'Hot',
    dietaryRestrictions: [],
    mealType: 'Dinner'
  }
]

export async function GET(request: NextRequest) {
  try {
    
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'anonymous'

    // Get user's latest quiz responses
    let userPreferences = null
    if (user) {
      const { data } = await supabase
        .from('quiz_responses')
        .select('responses')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      userPreferences = data?.[0]?.responses
    }

    // Filter and score recipes based on preferences
    let recommendations = MOCK_RECIPES

    if (userPreferences) {
      recommendations = MOCK_RECIPES
        .map(recipe => {
          let score = 0

          // Cuisine preference matching
          if (userPreferences.cuisinePreferences?.includes(recipe.cuisine)) {
            score += 3
          }

          // Dietary restrictions matching
          if (userPreferences.dietaryRestrictions?.length > 0) {
            const hasMatchingRestriction = userPreferences.dietaryRestrictions.some((restriction: string) =>
              recipe.dietaryRestrictions.includes(restriction)
            )
            if (hasMatchingRestriction) score += 2
            
            // Penalize if recipe doesn't match dietary restrictions
            const hasConflictingRestriction = userPreferences.dietaryRestrictions.some((restriction: string) => {
              if (restriction === 'Vegetarian' && !recipe.dietaryRestrictions.includes('Vegetarian') && recipe.tags.includes('Protein')) {
                return true
              }
              if (restriction === 'Vegan' && !recipe.dietaryRestrictions.includes('Vegan')) {
                return true
              }
              return false
            })
            if (hasConflictingRestriction) score -= 5
          }

          // Spice level matching
          const spiceLevels = ['Mild', 'Medium', 'Hot', 'Extra Hot']
          const userSpiceIndex = spiceLevels.indexOf(userPreferences.spiceLevel)
          const recipeSpiceIndex = spiceLevels.indexOf(recipe.spiceLevel)
          
          if (userSpiceIndex >= 0 && recipeSpiceIndex >= 0) {
            const spiceDiff = Math.abs(userSpiceIndex - recipeSpiceIndex)
            score += Math.max(0, 2 - spiceDiff)
          }

          // Meal type matching
          if (userPreferences.mealTypes?.includes(recipe.mealType)) {
            score += 1
          }

          return { ...recipe, score }
        })
        .filter(recipe => recipe.score >= 0) // Remove recipes with negative scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 6) // Return top 6 recommendations
    }

    // Remove score from response (if it exists)
    const cleanedRecommendations = recommendations.map(recipe => {
      const { score, ...cleanRecipe } = recipe as any
      return cleanRecipe
    })

    // Analytics temporarily disabled for deployment

    return NextResponse.json({
      success: true,
      recipes: cleanedRecommendations,
      personalized: !!userPreferences
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendations' 
      },
      { status: 500 }
    )
  }
}

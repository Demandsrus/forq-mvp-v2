import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface Dish {
  id: string
  name: string
  cuisine: string
  diet_tags: string[]
  allergens: string[]
  spice: number
  macros: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  taste: {
    sweet: number
    savory: number
    herby: number
    umami: number
    crunchy: number
    soft: number
  }
  url: string
  image_url: string
}

function calculateCompatibilityScore(dish: Dish, preferences: any): number {
  let score = 0
  let factors = 0

  // Cuisine preference (weight: 3)
  if (preferences.cuisinePreferences?.includes(dish.cuisine)) {
    score += 3
  }
  factors += 1

  // Spice level (weight: 2)
  const spiceLevels = ['Mild', 'Medium', 'Hot', 'Extra Hot']
  const userSpiceIndex = spiceLevels.indexOf(preferences.spiceLevel)
  const dishSpiceIndex = Math.min(dish.spice, 3) // Convert 0-5 to 0-3

  if (userSpiceIndex >= 0) {
    const spiceDiff = Math.abs(userSpiceIndex - dishSpiceIndex)
    const spiceScore = Math.max(0, 1 - spiceDiff / 3)
    score += spiceScore * 2
  }
  factors += 2

  // Diet compatibility (weight: 3)
  if (preferences.dietaryRestrictions?.length > 0) {
    const dietMatch = preferences.dietaryRestrictions.every((restriction: string) => {
      if (restriction === 'Vegetarian') return dish.diet_tags.includes('vegetarian')
      if (restriction === 'Vegan') return dish.diet_tags.includes('vegan')
      if (restriction === 'Gluten-Free') return dish.diet_tags.includes('gluten-free')
      return true
    })
    if (dietMatch) {
      score += 3
    } else {
      score -= 2 // Penalty for not matching dietary restrictions
    }
  }
  factors += 3

  return factors > 0 ? score / factors : 0
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser()

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

    // Fetch all dishes from Supabase
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch dishes' }, { status: 500 })
    }

    if (!dishes || dishes.length === 0) {
      return NextResponse.json({
        success: true,
        recipes: [],
        personalized: false,
        message: 'No dishes available'
      })
    }

    // Calculate compatibility scores and sort
    let recommendations = dishes

    if (userPreferences) {
      recommendations = dishes
        .map(dish => ({
          ...dish,
          score: calculateCompatibilityScore(dish, userPreferences)
        }))
        .filter(dish => dish.score >= 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    } else {
      // If no preferences, return random selection
      recommendations = dishes
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
    }

    // Convert dishes to recipe format for compatibility
    const formattedRecipes = recommendations.map(dish => ({
      id: dish.id,
      title: dish.name,
      description: `Delicious ${dish.cuisine} dish`,
      cuisine: dish.cuisine,
      tags: dish.diet_tags || [],
      spiceLevel: ['Mild', 'Mild', 'Medium', 'Medium', 'Hot', 'Extra Hot'][dish.spice] || 'Mild',
      dietaryRestrictions: dish.diet_tags || [],
      image_url: dish.image_url,
      url: dish.url,
      macros: dish.macros
    }))

    return NextResponse.json({
      success: true,
      recipes: formattedRecipes,
      personalized: !!userPreferences,
      totalDishes: dishes.length
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

// Add POST method for direct preference-based recommendations
export async function POST(request: NextRequest) {
  try {
    const { preferences } = await request.json()

    // Fetch all dishes from Supabase
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch dishes' }, { status: 500 })
    }

    if (!dishes || dishes.length === 0) {
      return NextResponse.json({ recommendations: [], explanation: 'No dishes available' })
    }

    // Calculate compatibility scores
    const scoredDishes = dishes.map(dish => ({
      ...dish,
      compatibilityScore: calculateCompatibilityScore(dish, preferences)
    }))

    // Sort by compatibility score and take top 5
    const topDishes = scoredDishes
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 5)

    // Generate AI explanation
    const dishNames = topDishes.map(d => d.name).join(', ')
    const prompt = `Based on user preferences for ${JSON.stringify(preferences)}, explain why these dishes were recommended: ${dishNames}. Keep it conversational and under 100 words.`

    let explanation = "These dishes match your taste preferences and dietary requirements!"

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      })

      explanation = completion.choices[0]?.message?.content || explanation
    } catch (aiError) {
      console.error('OpenAI error:', aiError)
      // Continue with default explanation if AI fails
    }

    return NextResponse.json({
      recommendations: topDishes,
      explanation,
      totalDishes: dishes.length
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

interface Dish {
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
}

interface RankedDish {
  id: string
  name: string
  image_url: string
  url: string
  macros: Dish['macros']
  score: number
  reason: string
}

// Cuisine adjacency map for related cuisine bonuses
const CUISINE_ADJACENCY: Record<string, string[]> = {
  'Japanese': ['Korean', 'Chinese', 'Vietnamese'],
  'Korean': ['Japanese', 'Chinese'],
  'Chinese': ['Japanese', 'Korean', 'Vietnamese', 'Thai'],
  'Vietnamese': ['Thai', 'Chinese'],
  'Thai': ['Vietnamese', 'Chinese', 'Indian'],
  'Indian': ['Thai', 'Middle Eastern'],
  'Middle Eastern': ['Mediterranean', 'Indian', 'Greek'],
  'Mediterranean': ['Greek', 'Italian', 'Middle Eastern'],
  'Greek': ['Mediterranean', 'Middle Eastern'],
  'Italian': ['Mediterranean'],
  'Mexican': ['American'],
  'American': ['Mexican']
}

function hasAllergyConflict(dish: Dish, profile: UserProfile): boolean {
  return dish.allergens.some(allergen => profile.allergy_tags.includes(allergen))
}

function hasDietConflict(dish: Dish, profile: UserProfile): boolean {
  // Check if user's diet requirements are compatible with dish
  for (const dietTag of profile.diet_tags) {
    switch (dietTag) {
      case 'vegan':
        // Vegan can't eat anything with dairy, eggs, or non-vegan tags
        if (dish.allergens.includes('dairy') || 
            dish.allergens.includes('eggs') || 
            !dish.diet_tags.includes('vegan')) {
          return true
        }
        break
      case 'vegetarian':
        // Vegetarian can eat vegan food, but not meat/fish
        if (!dish.diet_tags.includes('vegan') && 
            !dish.diet_tags.includes('vegetarian') && 
            !dish.diet_tags.includes('pescetarian')) {
          return true
        }
        break
      case 'pescetarian':
        // Pescetarian can eat vegetarian/vegan + fish, but not meat
        if (!dish.diet_tags.includes('vegan') && 
            !dish.diet_tags.includes('vegetarian') && 
            !dish.diet_tags.includes('pescetarian')) {
          return true
        }
        break
      case 'gluten_free':
        if (dish.allergens.includes('gluten')) {
          return true
        }
        break
    }
  }
  return false
}

function hasExcludedIngredient(dish: Dish, profile: UserProfile): boolean {
  const dishNameLower = dish.name.toLowerCase()
  return profile.excludes.some(exclude => 
    dishNameLower.includes(exclude.toLowerCase())
  )
}

function calculateCuisineScore(dish: Dish, profile: UserProfile): number {
  const cuisinePreference = profile.cuisines[dish.cuisine] || 0

  // Direct cuisine match - multiply by 2 for strong preferences
  if (cuisinePreference > 0) {
    return cuisinePreference * 2
  }

  // Adjacent cuisine bonus
  const adjacentCuisines = CUISINE_ADJACENCY[dish.cuisine] || []
  for (const adjacentCuisine of adjacentCuisines) {
    if (profile.cuisines[adjacentCuisine] > 0) {
      return 1 // +1 for adjacent/related cuisine
    }
  }

  return 0
}

function calculateTasteSimilarity(dish: Dish, profile: UserProfile): number {
  // Calculate L2 distance on three taste axes
  const sweetSavoryDiff = dish.taste.sweet_savory - profile.sweet_savory
  const herbyUmamiDiff = dish.taste.herby_umami - profile.herby_umami
  const crunchySoftDiff = dish.taste.crunchy_soft - profile.crunchy_soft
  
  const l2Distance = Math.sqrt(
    sweetSavoryDiff * sweetSavoryDiff +
    herbyUmamiDiff * herbyUmamiDiff +
    crunchySoftDiff * crunchySoftDiff
  )
  
  // Subtract from base and normalize to 0..80 band
  const baseScore = 80
  const penalty = l2Distance * 100
  return Math.max(0, Math.min(80, baseScore - penalty))
}

function calculateSpiceScore(dish: Dish, profile: UserProfile): number {
  const spiceDiff = Math.abs(profile.spice - dish.spice)
  return -spiceDiff * 2
}

function calculateGoalsScore(dish: Dish, profile: UserProfile): number {
  let score = 0
  
  for (const goal of profile.goals) {
    switch (goal) {
      case 'muscle_gain':
        if (dish.macros.protein >= 25) {
          score += 4
        }
        break
      case 'weight_loss':
        if (dish.macros.kcal <= 550) {
          score += 3
        }
        break
      case 'balanced':
        if (dish.macros.kcal >= 400 && dish.macros.kcal <= 750) {
          score += 2
        }
        break
    }
  }
  
  return score
}

function generateReason(dish: Dish, profile: UserProfile, components: {
  cuisine: number
  taste: number
  spice: number
  goals: number
}): string {
  const reasons: string[] = []

  // Cuisine match
  if (components.cuisine >= 1.5) {
    reasons.push(`matches your ${dish.cuisine} preference`)
  } else if (components.cuisine > 0) {
    reasons.push(`similar to your preferred cuisines`)
  }

  // Taste similarity
  if (components.taste > 60) {
    reasons.push('great taste match')
  } else if (components.taste > 40) {
    reasons.push('good taste compatibility')
  }

  // Spice level
  if (components.spice >= -2) {
    reasons.push('perfect spice level')
  } else if (components.spice >= -4) {
    reasons.push('suitable spice level')
  }

  // Goals
  if (components.goals > 0) {
    if (profile.goals.includes('muscle_gain') && dish.macros.protein >= 25) {
      reasons.push('high protein for muscle gain')
    }
    if (profile.goals.includes('weight_loss') && dish.macros.kcal <= 550) {
      reasons.push('low calorie for weight loss')
    }
    if (profile.goals.includes('balanced') && dish.macros.kcal >= 400 && dish.macros.kcal <= 750) {
      reasons.push('balanced nutrition')
    }
  }

  return reasons.length > 0 ? reasons.join(', ') : 'meets your dietary preferences'
}

export function rankDishes(profile: UserProfile, dishes: Dish[]): RankedDish[] {
  const rankedDishes: RankedDish[] = []
  
  for (const dish of dishes) {
    // Hard filters - exclude if any fail
    if (hasAllergyConflict(dish, profile) ||
        hasDietConflict(dish, profile) ||
        hasExcludedIngredient(dish, profile)) {
      continue // Score = 0, exclude
    }
    
    // Calculate score components
    const cuisineScore = calculateCuisineScore(dish, profile)
    const tasteScore = calculateTasteSimilarity(dish, profile)
    const spiceScore = calculateSpiceScore(dish, profile)
    const goalsScore = calculateGoalsScore(dish, profile)
    
    // Total score (0..100 range)
    const totalScore = Math.max(0, Math.min(100, 
      cuisineScore + tasteScore + spiceScore + goalsScore
    ))
    
    // Only include dishes with positive scores
    if (totalScore > 0) {
      const reason = generateReason(dish, profile, {
        cuisine: cuisineScore,
        taste: tasteScore,
        spice: spiceScore,
        goals: goalsScore
      })
      
      rankedDishes.push({
        id: dish.id,
        name: dish.name,
        image_url: dish.image_url,
        url: dish.url,
        macros: dish.macros,
        score: Math.round(totalScore),
        reason
      })
    }
  }
  
  // Sort by score descending and return top 10
  return rankedDishes
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

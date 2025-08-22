/**
 * Context helper utilities for restaurant search
 */

export type TimeOfDay = 'breakfast' | 'lunch' | 'dinner' | 'late_night'
export type Budget = '$' | '$$' | '$$$'
export type Platform = 'ubereats' | 'doordash' | 'postmates' | 'grubhub'

export interface SearchContext {
  craving?: string
  budget?: Budget
  time_of_day?: TimeOfDay
  mood?: string
  platform_pref?: Platform
  topK?: 4 | 5
}

export interface ResolvedContext {
  craving: string
  budget: Budget
  time_of_day: TimeOfDay
  mood: string
  platform_pref: Platform
  topK: 4 | 5
}

/**
 * Infer time of day from server clock if not provided
 */
export function inferTimeOfDay(): TimeOfDay {
  const now = new Date()
  const hour = now.getHours()
  
  if (hour >= 5 && hour < 11) {
    return 'breakfast'
  } else if (hour >= 11 && hour < 16) {
    return 'lunch'
  } else if (hour >= 16 && hour < 22) {
    return 'dinner'
  } else {
    return 'late_night'
  }
}

/**
 * Resolve context with defaults
 */
export function resolveContext(context: SearchContext = {}): ResolvedContext {
  return {
    craving: context.craving || '',
    budget: context.budget || '$$',
    time_of_day: context.time_of_day || inferTimeOfDay(),
    mood: context.mood || '',
    platform_pref: context.platform_pref || 'ubereats',
    topK: context.topK || 5
  }
}

/**
 * Get platform badge URL
 */
export function getPlatformBadge(platform: Platform): string {
  const badges: Record<Platform, string> = {
    ubereats: '/assets/platforms/ubereats.svg',
    doordash: '/assets/platforms/doordash.svg',
    postmates: '/assets/platforms/postmates.svg',
    grubhub: '/assets/platforms/grubhub.svg'
  }
  
  return badges[platform]
}

/**
 * Generate fuzzy search terms for craving
 */
export function generateSearchTerms(craving: string): string[] {
  if (!craving.trim()) return []
  
  const terms = craving.toLowerCase().trim().split(/\s+/)
  const searchTerms: string[] = []
  
  // Add original terms
  searchTerms.push(...terms)
  
  // Add common food synonyms and variations
  const synonyms: Record<string, string[]> = {
    'pizza': ['italian', 'cheese', 'pepperoni'],
    'burger': ['american', 'beef', 'fries'],
    'sushi': ['japanese', 'fish', 'rice'],
    'tacos': ['mexican', 'beef', 'chicken'],
    'pasta': ['italian', 'noodles', 'sauce'],
    'chicken': ['poultry', 'fried', 'grilled'],
    'beef': ['steak', 'meat', 'bbq'],
    'seafood': ['fish', 'shrimp', 'salmon'],
    'vegetarian': ['veggie', 'plant', 'salad'],
    'spicy': ['hot', 'chili', 'pepper'],
    'sweet': ['dessert', 'sugar', 'cake']
  }
  
  // Add synonyms for each term
  for (const term of terms) {
    if (synonyms[term]) {
      searchTerms.push(...synonyms[term])
    }
  }
  
  return [...new Set(searchTerms)] // Remove duplicates
}

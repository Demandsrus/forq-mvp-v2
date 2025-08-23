/**
 * Guardrails utility for FORQ to prevent recipes, SNAP/EBT, and cooking assumptions
 */

export const BANNED_PATTERNS = [
  /recipe/i,
  /step-?by-?step/i,
  /preheat/i,
  /oven/i,
  /cook\b/i,
  /stove/i,
  /SNAP\b/i,
  /\bEBT\b/i,
  /ingredients?:/i,
  /instructions?:/i,
  /directions?:/i,
  /preparation/i,
  /kitchen/i,
  /homemade/i,
  /serves \d+/i,
  /yields? \d+/i,
  /prep time/i,
  /cook time/i,
  /bake for/i,
  /simmer/i,
  /sauté/i,
  /chop/i,
  /dice/i,
  /mince/i,
  /tablespoon/i,
  /teaspoon/i,
  /cup of/i,
  /degrees? fahrenheit/i,
  /degrees? celsius/i
]

export const COOKING_LANGUAGE_PATTERNS = [
  /preheat the oven/i,
  /heat the oil/i,
  /add to pan/i,
  /cook for \d+ minutes/i,
  /stir occasionally/i,
  /season with/i,
  /bring to a boil/i,
  /reduce heat/i,
  /let cool/i,
  /serve immediately/i,
  /garnish with/i,
  /mix well/i,
  /combine ingredients/i,
  /whisk together/i,
  /fold in/i,
  /set aside/i
]

export interface SanitizeResult {
  ok: boolean
  cleaned: string
  reason?: string
}

/**
 * Sanitize assistant reply to prevent banned content
 */
export function sanitizeAssistantReply(text: string): SanitizeResult {
  const lowerText = text.toLowerCase()
  
  // Check for banned patterns
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return {
        ok: false,
        cleaned: "FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.",
        reason: `Matched banned pattern: ${pattern.source}`
      }
    }
  }

  // Check for recipe-like structure (numbered lists that look like instructions)
  const lines = text.split('\n')
  let numberedSteps = 0
  for (const line of lines) {
    if (/^\s*\d+\.\s/.test(line)) {
      numberedSteps++
    }
  }
  
  if (numberedSteps >= 3) {
    return {
      ok: false,
      cleaned: "FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.",
      reason: "Detected recipe-like numbered instructions"
    }
  }

  // Check for ingredient list patterns
  const bulletPoints = lines.filter(line => /^\s*[-*]\s/.test(line)).length
  if (bulletPoints >= 3 && lowerText.includes('ingredient')) {
    return {
      ok: false,
      cleaned: "FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.",
      reason: "Detected ingredient list pattern"
    }
  }

  return {
    ok: true,
    cleaned: text
  }
}

/**
 * Strip cooking language from text while preserving general intent
 */
export function stripCookingLanguage(text: string): string {
  let cleaned = text

  // Remove cooking instruction phrases
  for (const pattern of COOKING_LANGUAGE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }

  // Remove common cooking measurements and terms
  cleaned = cleaned.replace(/\b\d+\s*(tbsp|tsp|cup|oz|lb|gram|kg)\b/gi, '')
  cleaned = cleaned.replace(/\b\d+°[FC]\b/gi, '')
  cleaned = cleaned.replace(/\bfor \d+ minutes?\b/gi, '')
  cleaned = cleaned.replace(/\buntil golden brown\b/gi, '')
  cleaned = cleaned.replace(/\bto taste\b/gi, '')

  // Clean up extra whitespace and punctuation
  cleaned = cleaned.replace(/\s+/g, ' ')
  cleaned = cleaned.replace(/\s*,\s*,/g, ',')
  cleaned = cleaned.replace(/\s*\.\s*\./g, '.')
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * Check if a dish/item name contains cooking or recipe-related terms
 */
export function containsCookingTerms(name: string): boolean {
  const cookingTerms = [
    /recipe/i,
    /homemade/i,
    /cook/i,
    /prep/i,
    /serves \d+/i,
    /yields? \d+/i,
    /\bmake at home\b/i,
    /\bDIY\b/i,
    /\bhow to\b/i,
    /step-?by-?step/i
  ]

  return cookingTerms.some(pattern => pattern.test(name))
}

/**
 * Check if a URL contains cooking or recipe-related terms
 */
export function containsCookingUrl(url: string): boolean {
  const cookingUrlTerms = [
    /recipe/i,
    /cooking/i,
    /kitchen/i,
    /homemade/i,
    /allrecipes/i,
    /foodnetwork/i,
    /epicurious/i,
    /tasty/i,
    /buzzfeed.*food/i
  ]

  return cookingUrlTerms.some(pattern => pattern.test(url))
}

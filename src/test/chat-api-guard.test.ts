import { describe, it, expect } from 'vitest'

/**
 * Server-side guard function extracted from chat API for testing
 */
function filterRecipeContent(content: string): string {
  const lines = content.split('\n')
  const filteredLines: string[] = []
  let inJsonBlock = false
  let braceCount = 0

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip obvious recipe content patterns
    if (
      trimmedLine.match(/^(ingredients?|instructions?|directions?|steps?|recipe|cooking|preparation):/i) ||
      trimmedLine.match(/^\d+\.\s/) || // Numbered steps
      trimmedLine.match(/^-\s/) || // Bullet points
      trimmedLine.match(/^(add|mix|cook|bake|fry|boil|simmer|heat|stir|combine)/i) ||
      trimmedLine.match(/^\*\s/) // Asterisk bullets
    ) {
      continue
    }

    // Track JSON blocks
    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length
    
    if (openBraces > 0) {
      inJsonBlock = true
    }
    
    braceCount += openBraces - closeBraces
    
    // Include line if it's part of JSON or looks like valid response content
    if (inJsonBlock || trimmedLine.includes('"intent"') || trimmedLine.includes('"reply"')) {
      filteredLines.push(line)
    }
    
    if (braceCount <= 0 && inJsonBlock) {
      inJsonBlock = false
    }
  }

  return filteredLines.join('\n').trim() || content
}

/**
 * Complete chat response processing with guard
 */
function processChatResponse(rawResponse: string) {
  // Server-side guard: Filter out recipe-style content and extract JSON
  const cleanedResponse = filterRecipeContent(rawResponse)

  // Parse JSON response
  let parsedResponse
  try {
    parsedResponse = JSON.parse(cleanedResponse)
  } catch (error) {
    // Try to extract JSON from mixed content
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0])
      } catch {
        // Final fallback
        parsedResponse = {
          intent: "general",
          reply: cleanedResponse,
          context: {}
        }
      }
    } else {
      // Fallback if JSON parsing fails
      parsedResponse = {
        intent: "general",
        reply: cleanedResponse,
        context: {}
      }
    }
  }

  return parsedResponse
}

describe('Chat API Server-side Guard', () => {
  describe('Recipe content filtering', () => {
    it('should filter out ingredients list', () => {
      const recipeResponse = `Here's a great pasta recipe!

      Ingredients:
      - 2 cups flour
      - 3 eggs
      - 1 tsp salt
      - 2 tbsp olive oil

      {"intent": "general", "reply": "I provided a pasta recipe.", "context": {}}`

      const result = processChatResponse(recipeResponse)

      expect(result.intent).toBe('general')
      expect(result.reply).toBe('I provided a pasta recipe.')
      expect(result.context).toEqual({})
    })

    it('should filter out numbered cooking instructions', () => {
      const recipeResponse = `Let me help you cook pasta:

      Instructions:
      1. Bring a large pot of water to boil
      2. Add salt to the water
      3. Add pasta and cook for 8-10 minutes
      4. Drain and serve

      {"intent": "general", "reply": "Follow these pasta cooking steps.", "context": {}}`

      const result = processChatResponse(recipeResponse)

      expect(result.intent).toBe('general')
      expect(result.reply).toBe('Follow these pasta cooking steps.')
    })

    it('should filter out cooking action words', () => {
      const recipeResponse = `Add the onions to the pan
      Mix well with a wooden spoon
      Cook for 5 minutes until golden
      Stir occasionally
      Heat the oil in a large skillet
      
      {"intent": "get_recs", "reply": "Let me find restaurants instead!", "context": {"craving": "italian"}}`

      const result = processChatResponse(recipeResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Let me find restaurants instead!')
      expect(result.context.craving).toBe('italian')
    })

    it('should filter out bullet point lists', () => {
      const recipeResponse = `Here's what you need:

      - Fresh tomatoes
      - Basil leaves
      - Mozzarella cheese
      - Olive oil
      * Salt and pepper
      * Balsamic vinegar

      {"intent": "get_recs", "reply": "Or I can find pizza places for you!", "context": {"craving": "pizza"}}`

      const result = processChatResponse(recipeResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Or I can find pizza places for you!')
      expect(result.context.craving).toBe('pizza')
    })
  })

  describe('JSON preservation', () => {
    it('should preserve valid JSON when mixed with recipe content', () => {
      const mixedResponse = `I can help you with that recipe!

      Ingredients:
      - Chicken breast
      - Vegetables
      - Seasonings

      Instructions:
      1. Season the chicken
      2. Cook in pan for 10 minutes
      3. Add vegetables

      {"intent": "get_recs", "reply": "Actually, let me find restaurants serving this dish!", "context": {"craving": "chicken", "time_of_day": "dinner"}}`

      const result = processChatResponse(mixedResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Actually, let me find restaurants serving this dish!')
      expect(result.context.craving).toBe('chicken')
      expect(result.context.time_of_day).toBe('dinner')
    })

    it('should handle JSON at the beginning of response', () => {
      const jsonFirstResponse = `{"intent": "get_recs", "reply": "I'll find pizza places for you!", "context": {"craving": "pizza"}}

      But if you want to make it yourself:
      
      Ingredients:
      - Pizza dough
      - Tomato sauce
      - Cheese`

      const result = processChatResponse(jsonFirstResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe("I'll find pizza places for you!")
      expect(result.context.craving).toBe('pizza')
    })

    it('should handle multiline JSON', () => {
      const multilineJsonResponse = `Here's a recipe, but let me suggest restaurants instead:

      Ingredients:
      - Various items

      {
        "intent": "get_recs",
        "reply": "I found some great options for you!",
        "context": {
          "craving": "sushi",
          "mood": "fancy",
          "time_of_day": "dinner"
        }
      }

      Instructions:
      1. Don't cook, order instead!`

      const result = processChatResponse(multilineJsonResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('I found some great options for you!')
      expect(result.context.craving).toBe('sushi')
      expect(result.context.mood).toBe('fancy')
      expect(result.context.time_of_day).toBe('dinner')
    })
  })

  describe('Edge cases', () => {
    it('should handle content with no JSON', () => {
      const noJsonResponse = `Ingredients:
      - Flour
      - Water
      - Salt

      Instructions:
      1. Mix ingredients
      2. Knead dough
      3. Let rise`

      const result = processChatResponse(noJsonResponse)

      expect(result.intent).toBe('general')
      expect(result.context).toEqual({})
      // Should return original content when no JSON found
    })

    it('should handle pure JSON response (no filtering needed)', () => {
      const pureJsonResponse = `{"intent": "get_recs", "reply": "Looking for restaurants!", "context": {"craving": "thai"}}`

      const result = processChatResponse(pureJsonResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Looking for restaurants!')
      expect(result.context.craving).toBe('thai')
    })

    it('should handle malformed JSON with recipe content', () => {
      const malformedResponse = `Ingredients:
      - Broken recipe

      {"intent": "get_recs", "reply": "Malformed JSON here,
      "context": {"craving": "pizza"}

      Instructions:
      1. This won't parse`

      const result = processChatResponse(malformedResponse)

      expect(result.intent).toBe('general')
      // Should fallback gracefully
    })

    it('should preserve non-recipe content', () => {
      const nonRecipeResponse = `I understand you're looking for food recommendations.

      {"intent": "get_recs", "reply": "Let me help you find great restaurants!", "context": {"craving": "mexican"}}

      I can search for restaurants in your area that serve authentic Mexican cuisine.`

      const result = processChatResponse(nonRecipeResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Let me help you find great restaurants!')
      expect(result.context.craving).toBe('mexican')
    })

    it('should handle recipe keywords in valid context', () => {
      const contextualResponse = `{"intent": "get_recs", "reply": "I'll find restaurants that cook amazing steaks!", "context": {"craving": "steak", "mood": "cook at restaurant"}}`

      const result = processChatResponse(contextualResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe("I'll find restaurants that cook amazing steaks!")
      expect(result.context.craving).toBe('steak')
      expect(result.context.mood).toBe('cook at restaurant')
    })
  })

  describe('Restaurant search integration', () => {
    it('should properly extract context for restaurant search when intent is get_recs', () => {
      const restaurantResponse = `I can help you cook that, but let me find restaurants instead!

      Ingredients:
      - Skip these

      {"intent": "get_recs", "reply": "I found some great pizza places!", "context": {"craving": "pizza", "time_of_day": "dinner", "budget": "$$"}}`

      const result = processChatResponse(restaurantResponse)

      expect(result.intent).toBe('get_recs')
      expect(result.context.craving).toBe('pizza')
      expect(result.context.time_of_day).toBe('dinner')
      expect(result.context.budget).toBe('$$')

      // This context should be suitable for restaurant search API
      expect(typeof result.context).toBe('object')
    })

    it('should handle general intent without restaurant search', () => {
      const generalResponse = `Here's some cooking advice:

      Tips:
      - Use fresh ingredients
      - Season well

      {"intent": "general", "reply": "Here are some cooking tips for you.", "context": {}}`

      const result = processChatResponse(generalResponse)

      expect(result.intent).toBe('general')
      expect(result.context).toEqual({})
      // Should not trigger restaurant search
    })
  })
})

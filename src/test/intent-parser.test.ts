import { describe, it, expect } from 'vitest'

/**
 * Helper function to parse intent JSON (extracted from chat API logic)
 */
function parseIntentJSON(rawResponse: string) {
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

describe('Intent JSON Parser', () => {
  describe('Valid JSON parsing', () => {
    it('should parse valid get_recs intent JSON', () => {
      const validJSON = `{
        "intent": "get_recs",
        "reply": "I'd love to help you find some great pizza places!",
        "context": {
          "craving": "pizza",
          "time_of_day": "dinner"
        }
      }`

      const result = parseIntentJSON(validJSON)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe("I'd love to help you find some great pizza places!")
      expect(result.context.craving).toBe('pizza')
      expect(result.context.time_of_day).toBe('dinner')
    })

    it('should parse valid general intent JSON', () => {
      const validJSON = `{
        "intent": "general",
        "reply": "To cook pasta properly, bring water to a boil and add salt.",
        "context": {}
      }`

      const result = parseIntentJSON(validJSON)

      expect(result.intent).toBe('general')
      expect(result.reply).toBe('To cook pasta properly, bring water to a boil and add salt.')
      expect(result.context).toEqual({})
    })

    it('should handle JSON with all context fields', () => {
      const validJSON = `{
        "intent": "get_recs",
        "reply": "Looking for something healthy and affordable for lunch!",
        "context": {
          "craving": "healthy",
          "mood": "light",
          "time_of_day": "lunch",
          "budget": "$"
        }
      }`

      const result = parseIntentJSON(validJSON)

      expect(result.intent).toBe('get_recs')
      expect(result.context.craving).toBe('healthy')
      expect(result.context.mood).toBe('light')
      expect(result.context.time_of_day).toBe('lunch')
      expect(result.context.budget).toBe('$')
    })
  })

  describe('Invalid JSON handling', () => {
    it('should handle malformed JSON with fallback', () => {
      const invalidJSON = `{
        "intent": "get_recs",
        "reply": "I'd love to help you find pizza,
        "context": {
          "craving": "pizza"
        }
      }`

      const result = parseIntentJSON(invalidJSON)

      expect(result.intent).toBe('general')
      expect(result.reply).toContain('pizza')
    })

    it('should handle completely invalid JSON', () => {
      const invalidJSON = 'This is not JSON at all!'

      const result = parseIntentJSON(invalidJSON)

      expect(result.intent).toBe('general')
      expect(result.reply).toBe('This is not JSON at all!')
      expect(result.context).toEqual({})
    })

    it('should extract JSON from mixed content', () => {
      const mixedContent = `Here's some text before the JSON.
      
      {"intent": "get_recs", "reply": "Great choice!", "context": {"craving": "sushi"}}
      
      And some text after.`

      const result = parseIntentJSON(mixedContent)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Great choice!')
      expect(result.context.craving).toBe('sushi')
    })
  })

  describe('Recipe content filtering', () => {
    it('should filter out recipe instructions and keep JSON', () => {
      const recipeContent = `Here's a great pasta recipe:

      Ingredients:
      - 1 lb pasta
      - 2 cups tomato sauce
      - 1 cup cheese

      Instructions:
      1. Boil water in a large pot
      2. Add pasta and cook for 8-10 minutes
      3. Drain and serve

      {"intent": "general", "reply": "I provided a pasta recipe for you.", "context": {}}`

      const result = parseIntentJSON(recipeContent)

      expect(result.intent).toBe('general')
      expect(result.reply).toBe('I provided a pasta recipe for you.')
      expect(result.context).toEqual({})
    })

    it('should filter out cooking instructions', () => {
      const cookingContent = `Add the onions to the pan
      Mix well with a wooden spoon
      Cook for 5 minutes until golden
      
      {"intent": "get_recs", "reply": "Let me find restaurants instead!", "context": {"craving": "italian"}}`

      const result = parseIntentJSON(cookingContent)

      expect(result.intent).toBe('get_recs')
      expect(result.reply).toBe('Let me find restaurants instead!')
      expect(result.context.craving).toBe('italian')
    })

    it('should handle content with no JSON', () => {
      const noJsonContent = `Ingredients:
      - Flour
      - Eggs
      - Milk
      
      Instructions:
      1. Mix ingredients
      2. Cook in pan`

      const result = parseIntentJSON(noJsonContent)

      expect(result.intent).toBe('general')
      expect(result.context).toEqual({})
    })
  })
})

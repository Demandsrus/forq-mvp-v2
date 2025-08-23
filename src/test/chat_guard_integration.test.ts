import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sanitizeAssistantReply, stripCookingLanguage } from '@/lib/guardrails'
import { applySafetyFilter } from '@/lib/recs_safety'

// Mock the dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
  },
}))

vi.mock('@/lib/analytics', () => ({
  analytics: {
    track: vi.fn(),
  },
}))

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  }
})

// Mock fetch for restaurant search
global.fetch = vi.fn()

describe('Chat Guard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Recipe content with valid JSON', () => {
    it('should sanitize recipe content but preserve restaurant search', () => {
      const modelReply = `Here's a great pasta recipe:

      Ingredients:
      - 2 cups flour
      - 3 eggs
      - Salt to taste

      Instructions:
      1. Mix flour and eggs
      2. Knead the dough
      3. Cook for 10 minutes

      {"intent": "get_recs", "reply": "Actually, let me find great pasta restaurants for you!", "context": {"craving": "pasta", "time_of_day": "dinner"}}`

      // Simulate the chat API processing
      const sanitizeResult = sanitizeAssistantReply(modelReply)
      
      expect(sanitizeResult.ok).toBe(false)
      expect(sanitizeResult.cleaned).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")

      // The JSON should still be extractable for restaurant search
      const jsonMatch = modelReply.match(/\{[\s\S]*\}/)
      expect(jsonMatch).toBeTruthy()
      
      if (jsonMatch) {
        const parsedJSON = JSON.parse(jsonMatch[0])
        expect(parsedJSON.intent).toBe('get_recs')
        expect(parsedJSON.context.craving).toBe('pasta')
      }
    })

    it('should force get_recs intent when sanitization occurs on general intent', () => {
      const modelReply = `Here's how to cook pasta:
      1. Boil water
      2. Add pasta
      3. Cook for 8 minutes
      
      {"intent": "general", "reply": "I provided cooking instructions.", "context": {}}`

      const sanitizeResult = sanitizeAssistantReply(modelReply)
      
      expect(sanitizeResult.ok).toBe(false)

      // Simulate the chat API logic
      let parsedResponse = { intent: "general", reply: "I provided cooking instructions.", context: {} }
      
      if (!sanitizeResult.ok) {
        parsedResponse.reply = sanitizeResult.cleaned
        if (parsedResponse.intent !== 'get_recs') {
          parsedResponse.intent = 'get_recs'
          parsedResponse.context = { topK: 3 }
        }
      }

      expect(parsedResponse.intent).toBe('get_recs')
      expect(parsedResponse.context).toEqual({ topK: 3 })
      expect(parsedResponse.reply).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
    })
  })

  describe('SNAP/EBT questions', () => {
    it('should sanitize SNAP questions and pivot to restaurant search', () => {
      const snapQuestion = `Do you accept SNAP/EBT benefits for food delivery?
      
      {"intent": "general", "reply": "Let me check our payment options.", "context": {}}`

      const sanitizeResult = sanitizeAssistantReply(snapQuestion)
      
      expect(sanitizeResult.ok).toBe(false)
      expect(sanitizeResult.reason).toContain('SNAP')

      // Simulate the chat API processing
      let parsedResponse = { intent: "general", reply: "Let me check our payment options.", context: {} }
      
      if (!sanitizeResult.ok) {
        parsedResponse.reply = sanitizeResult.cleaned
        if (parsedResponse.intent !== 'get_recs') {
          parsedResponse.intent = 'get_recs'
          parsedResponse.context = { topK: 3 }
        }
      }

      expect(parsedResponse.intent).toBe('get_recs')
      expect(parsedResponse.reply).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
    })

    it('should handle EBT mentions in mixed content', () => {
      const ebtText = "I'm looking for restaurants that accept EBT cards for delivery"
      const sanitizeResult = sanitizeAssistantReply(ebtText)
      
      expect(sanitizeResult.ok).toBe(false)
      expect(sanitizeResult.reason).toContain('EBT')
    })
  })

  describe('Cooking language stripping', () => {
    it('should strip cooking instructions from valid responses', () => {
      const textWithCooking = "This restaurant serves amazing pasta! Preheat the oven to 350°F and cook for 20 minutes. The flavors are incredible!"
      const stripped = stripCookingLanguage(textWithCooking)
      
      expect(stripped).not.toContain('preheat the oven')
      expect(stripped).not.toContain('cook for 20 minutes')
      expect(stripped).toContain('This restaurant serves amazing pasta!')
      expect(stripped).toContain('The flavors are incredible!')
    })

    it('should remove cooking measurements', () => {
      const textWithMeasurements = "They use 2 tbsp of olive oil and cook at 350°F for the perfect taste"
      const stripped = stripCookingLanguage(textWithMeasurements)
      
      expect(stripped).not.toContain('2 tbsp')
      expect(stripped).not.toContain('350°F')
      expect(stripped).toContain('olive oil')
      expect(stripped).toContain('perfect taste')
    })
  })

  describe('Restaurant search safety filtering', () => {
    it('should filter cooking content from restaurant search results', () => {
      const mockSearchResults = {
        results: [
          {
            restaurant: { id: 'rest1', name: 'Italian Place' },
            recommended_items: [
              { id: '1', name: 'Margherita Pizza', url: 'https://ubereats.com/dish1' },
              { id: '2', name: 'Homemade Pasta Recipe Kit', url: 'https://allrecipes.com/recipe/123' },
              { id: '3', name: 'Caesar Salad', url: 'https://ubereats.com/dish3' }
            ]
          }
        ]
      }

      const filtered = applySafetyFilter(mockSearchResults)
      
      expect(filtered.results[0].recommended_items).toHaveLength(2)
      expect(filtered.results[0].recommended_items.find((item: any) => item.id === '1')).toBeDefined()
      expect(filtered.results[0].recommended_items.find((item: any) => item.id === '3')).toBeDefined()
      expect(filtered.results[0].recommended_items.find((item: any) => item.id === '2')).toBeUndefined()
    })

    it('should handle empty or missing recommended items', () => {
      const mockSearchResults = {
        results: [
          {
            restaurant: { id: 'rest1', name: 'Italian Place' },
            recommended_items: []
          },
          {
            restaurant: { id: 'rest2', name: 'Pizza Place' }
            // No recommended_items field
          }
        ]
      }

      const filtered = applySafetyFilter(mockSearchResults)
      
      expect(filtered.results).toHaveLength(2)
      expect(filtered.results[0].recommended_items).toEqual([])
      expect(filtered.results[1].recommended_items).toBeUndefined()
    })
  })

  describe('End-to-end chat flow simulation', () => {
    it('should handle recipe request with complete sanitization flow', () => {
      // Simulate a user asking for a recipe
      const userMessage = "How do I make homemade pizza?"
      
      // Simulate model response with recipe content + JSON
      const modelResponse = `I'd love to help you make pizza at home!

      Ingredients:
      - Pizza dough
      - Tomato sauce
      - Mozzarella cheese

      Instructions:
      1. Preheat oven to 450°F
      2. Roll out the dough
      3. Add sauce and cheese
      4. Bake for 12-15 minutes

      {"intent": "general", "reply": "I provided a homemade pizza recipe for you!", "context": {}}`

      // Step 1: Extract JSON
      const jsonMatch = modelResponse.match(/\{[\s\S]*\}/)
      expect(jsonMatch).toBeTruthy()
      
      let parsedResponse = JSON.parse(jsonMatch![0])
      
      // Step 2: Apply guardrails
      const sanitizeResult = sanitizeAssistantReply(parsedResponse.reply)
      expect(sanitizeResult.ok).toBe(false)
      
      // Step 3: Override with safe message and force get_recs
      parsedResponse.reply = sanitizeResult.cleaned
      if (parsedResponse.intent !== 'get_recs') {
        parsedResponse.intent = 'get_recs'
        parsedResponse.context = { topK: 3 }
      }
      
      // Step 4: Verify final state
      expect(parsedResponse.intent).toBe('get_recs')
      expect(parsedResponse.reply).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
      expect(parsedResponse.context.topK).toBe(3)
    })

    it('should preserve valid restaurant recommendations without sanitization', () => {
      const validResponse = `I'd recommend checking out Tony's Pizza Palace for authentic Italian pizza!

      {"intent": "get_recs", "reply": "Tony's Pizza Palace has amazing authentic Italian pizza!", "context": {"craving": "pizza", "time_of_day": "dinner"}}`

      const jsonMatch = validResponse.match(/\{[\s\S]*\}/)
      const parsedResponse = JSON.parse(jsonMatch![0])
      
      const sanitizeResult = sanitizeAssistantReply(parsedResponse.reply)
      expect(sanitizeResult.ok).toBe(true)
      
      const finalReply = stripCookingLanguage(parsedResponse.reply)
      
      expect(finalReply).toBe("Tony's Pizza Palace has amazing authentic Italian pizza!")
      expect(parsedResponse.intent).toBe('get_recs')
      expect(parsedResponse.context.craving).toBe('pizza')
    })
  })

  describe('Edge cases', () => {
    it('should handle malformed JSON with recipe content', () => {
      const malformedResponse = `Here's a recipe:
      1. Cook pasta
      2. Add sauce
      
      {"intent": "get_recs", "reply": "Malformed JSON here`

      const sanitizeResult = sanitizeAssistantReply(malformedResponse)
      expect(sanitizeResult.ok).toBe(false)
      
      // Even with malformed JSON, sanitization should work
      expect(sanitizeResult.cleaned).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
    })

    it('should handle empty or null responses', () => {
      expect(sanitizeAssistantReply("")).toEqual({ ok: true, cleaned: "" })
      expect(stripCookingLanguage("")).toBe("")
      expect(applySafetyFilter(null)).toBe(null)
      expect(applySafetyFilter(undefined)).toBe(undefined)
    })

    it('should handle responses with only cooking terms but no instructions', () => {
      const cookingMention = "This restaurant has a great cook who makes amazing food!"
      const sanitizeResult = sanitizeAssistantReply(cookingMention)
      
      expect(sanitizeResult.ok).toBe(false) // "cook" is a banned pattern
      expect(sanitizeResult.reason).toContain('cook')
    })
  })
})

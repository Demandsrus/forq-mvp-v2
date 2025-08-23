import { describe, it, expect } from 'vitest'
import { 
  sanitizeAssistantReply, 
  stripCookingLanguage, 
  BANNED_PATTERNS,
  containsCookingTerms,
  containsCookingUrl
} from '@/lib/guardrails'
import { filterOutCookingOrRecipe, applySafetyFilter } from '@/lib/recs_safety'

describe('Guardrails', () => {
  describe('sanitizeAssistantReply', () => {
    it('should reject recipe content', () => {
      const recipeText = "Here's a great pasta recipe: First, boil water..."
      const result = sanitizeAssistantReply(recipeText)
      
      expect(result.ok).toBe(false)
      expect(result.cleaned).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
      expect(result.reason).toContain('recipe')
    })

    it('should reject SNAP/EBT content', () => {
      const snapText = "Do you accept EBT/SNAP benefits for food delivery?"
      const result = sanitizeAssistantReply(snapText)

      expect(result.ok).toBe(false)
      expect(result.cleaned).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
      expect(result.reason).toMatch(/(SNAP|EBT)/)
    })

    it('should reject cooking instructions', () => {
      const cookingText = "Preheat the oven to 350°F and cook for 20 minutes"
      const result = sanitizeAssistantReply(cookingText)
      
      expect(result.ok).toBe(false)
      expect(result.cleaned).toBe("FORQ focuses on delivery from real restaurants, not home cooking or benefits programs. Here are tailored restaurant options instead.")
    })

    it('should reject numbered recipe steps', () => {
      const stepsText = `Here's how to make it:
      1. Heat oil in a pan
      2. Add onions and cook
      3. Season with salt
      4. Serve hot`

      const result = sanitizeAssistantReply(stepsText)

      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/(numbered instructions|cook)/)
    })

    it('should reject ingredient lists', () => {
      const ingredientText = `You'll need these ingredients:
      - 2 cups flour
      - 3 eggs
      - 1 tsp salt
      - Oil for frying`

      const result = sanitizeAssistantReply(ingredientText)

      expect(result.ok).toBe(false)
      expect(result.reason).toMatch(/(ingredient|ingredients)/)
    })

    it('should allow normal restaurant recommendations', () => {
      const normalText = "I'd recommend trying the pizza at Tony's Italian Restaurant!"
      const result = sanitizeAssistantReply(normalText)
      
      expect(result.ok).toBe(true)
      expect(result.cleaned).toBe(normalText)
    })

    it('should allow food descriptions without cooking terms', () => {
      const foodText = "This restaurant serves amazing pasta with rich tomato sauce and fresh basil."
      const result = sanitizeAssistantReply(foodText)
      
      expect(result.ok).toBe(true)
      expect(result.cleaned).toBe(foodText)
    })
  })

  describe('stripCookingLanguage', () => {
    it('should remove cooking instructions', () => {
      const text = "This dish is great! Preheat the oven to 350°F and cook for 20 minutes until golden brown."
      const result = stripCookingLanguage(text)
      
      expect(result).not.toContain('preheat the oven')
      expect(result).not.toContain('cook for 20 minutes')
      expect(result).not.toContain('until golden brown')
      expect(result).toContain('This dish is great!')
    })

    it('should remove cooking measurements', () => {
      const text = "Add 2 tbsp oil and 1 cup flour, then heat to 350°F"
      const result = stripCookingLanguage(text)
      
      expect(result).not.toContain('2 tbsp')
      expect(result).not.toContain('1 cup')
      expect(result).not.toContain('350°F')
    })

    it('should preserve non-cooking content', () => {
      const text = "This restaurant is located at 123 Main Street and serves excellent food."
      const result = stripCookingLanguage(text)
      
      expect(result).toBe(text)
    })

    it('should clean up extra whitespace', () => {
      const text = "Great food,  ,  excellent service."
      const result = stripCookingLanguage(text)
      
      expect(result).toBe("Great food, excellent service.")
    })
  })

  describe('containsCookingTerms', () => {
    it('should detect recipe terms in dish names', () => {
      expect(containsCookingTerms("Homemade Pasta Recipe")).toBe(true)
      expect(containsCookingTerms("DIY Pizza Kit")).toBe(true)
      expect(containsCookingTerms("How to Make Ramen")).toBe(true)
      expect(containsCookingTerms("Serves 4 people")).toBe(true)
    })

    it('should allow normal dish names', () => {
      expect(containsCookingTerms("Margherita Pizza")).toBe(false)
      expect(containsCookingTerms("Chicken Teriyaki Bowl")).toBe(false)
      expect(containsCookingTerms("Fresh Garden Salad")).toBe(false)
    })
  })

  describe('containsCookingUrl', () => {
    it('should detect cooking/recipe URLs', () => {
      expect(containsCookingUrl("https://allrecipes.com/recipe/123")).toBe(true)
      expect(containsCookingUrl("https://foodnetwork.com/recipes/pasta")).toBe(true)
      expect(containsCookingUrl("https://tasty.co/recipe/homemade-pizza")).toBe(true)
    })

    it('should allow restaurant URLs', () => {
      expect(containsCookingUrl("https://ubereats.com/restaurant/123")).toBe(false)
      expect(containsCookingUrl("https://doordash.com/store/pizza-place")).toBe(false)
    })
  })

  describe('BANNED_PATTERNS', () => {
    it('should include all expected patterns', () => {
      const patterns = BANNED_PATTERNS.map(p => p.source.toLowerCase())
      
      expect(patterns).toContain('recipe')
      expect(patterns).toContain('step-?by-?step')
      expect(patterns).toContain('preheat')
      expect(patterns).toContain('oven')
      expect(patterns).toContain('cook\\b')
      expect(patterns).toContain('stove')
      expect(patterns).toContain('snap\\b')
      expect(patterns).toContain('\\bebt\\b')
    })

    it('should match recipe-related text', () => {
      const recipeText = "Here's a step-by-step recipe for homemade pasta"
      const hasMatch = BANNED_PATTERNS.some(pattern => pattern.test(recipeText))
      expect(hasMatch).toBe(true)
    })

    it('should match SNAP/EBT text', () => {
      const snapText = "Do you accept SNAP benefits?"
      const hasMatch = BANNED_PATTERNS.some(pattern => pattern.test(snapText))
      expect(hasMatch).toBe(true)
    })
  })
})

describe('Recs Safety', () => {
  describe('filterOutCookingOrRecipe', () => {
    it('should remove dishes with cooking terms in name', () => {
      const dishes = [
        { id: '1', name: 'Margherita Pizza', url: 'https://ubereats.com/dish1' },
        { id: '2', name: 'Homemade Ramen (recipe)', url: 'https://ubereats.com/dish2' },
        { id: '3', name: 'Fresh Salad', url: 'https://ubereats.com/dish3' }
      ]

      const filtered = filterOutCookingOrRecipe(dishes)
      
      expect(filtered).toHaveLength(2)
      expect(filtered.find(d => d.id === '1')).toBeDefined()
      expect(filtered.find(d => d.id === '3')).toBeDefined()
      expect(filtered.find(d => d.id === '2')).toBeUndefined()
    })

    it('should remove dishes with cooking URLs', () => {
      const dishes = [
        { id: '1', name: 'Pizza', url: 'https://ubereats.com/dish1' },
        { id: '2', name: 'Pasta', url: 'https://allrecipes.com/recipe/123' },
        { id: '3', name: 'Salad', url: 'https://doordash.com/dish3' }
      ]

      const filtered = filterOutCookingOrRecipe(dishes)
      
      expect(filtered).toHaveLength(2)
      expect(filtered.find(d => d.id === '1')).toBeDefined()
      expect(filtered.find(d => d.id === '3')).toBeDefined()
      expect(filtered.find(d => d.id === '2')).toBeUndefined()
    })
  })

  describe('applySafetyFilter', () => {
    it('should filter restaurant search results', () => {
      const data = {
        results: [
          {
            restaurant: { id: 'rest1', name: 'Pizza Place' },
            recommended_items: [
              { id: '1', name: 'Pizza', url: 'https://ubereats.com/dish1' },
              { id: '2', name: 'Homemade Recipe Kit', url: 'https://ubereats.com/dish2' }
            ]
          }
        ]
      }

      const filtered = applySafetyFilter(data)
      
      expect(filtered.results[0].recommended_items).toHaveLength(1)
      expect(filtered.results[0].recommended_items[0].id).toBe('1')
    })

    it('should filter flat dish arrays', () => {
      const data = {
        dishes: [
          { id: '1', name: 'Pizza', url: 'https://ubereats.com/dish1' },
          { id: '2', name: 'DIY Cooking Kit', url: 'https://ubereats.com/dish2' }
        ]
      }

      const filtered = applySafetyFilter(data)
      
      expect(filtered.dishes).toHaveLength(1)
      expect(filtered.dishes[0].id).toBe('1')
    })

    it('should handle data without filterable arrays', () => {
      const data = { message: 'Hello', count: 5 }
      const filtered = applySafetyFilter(data)
      
      expect(filtered).toEqual(data)
    })
  })
})

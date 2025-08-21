import { describe, it, expect } from 'vitest'
import { rankDishes } from './rankDishes'

// Mock dishes for testing
const mockDishes = [
  {
    id: '1',
    name: 'Chicken Teriyaki Bowl',
    cuisine: 'Japanese',
    diet_tags: ['gluten_free'],
    allergens: ['soy'],
    spice: 1,
    macros: { kcal: 420, protein: 35, carbs: 45, fat: 12 },
    taste: { sweet_savory: 0.7, herby_umami: 0.8, crunchy_soft: 0.3 },
    url: 'https://example.com/chicken-teriyaki',
    image_url: 'https://example.com/chicken-teriyaki.jpg'
  },
  {
    id: '2',
    name: 'Vegan Buddha Bowl',
    cuisine: 'American',
    diet_tags: ['vegan', 'gluten_free'],
    allergens: [],
    spice: 0,
    macros: { kcal: 380, protein: 15, carbs: 55, fat: 12 },
    taste: { sweet_savory: 0.3, herby_umami: 0.6, crunchy_soft: 0.7 },
    url: 'https://example.com/buddha-bowl',
    image_url: 'https://example.com/buddha-bowl.jpg'
  },
  {
    id: '3',
    name: 'Spicy Thai Curry',
    cuisine: 'Thai',
    diet_tags: ['gluten_free'],
    allergens: ['dairy'],
    spice: 4,
    macros: { kcal: 450, protein: 28, carbs: 20, fat: 30 },
    taste: { sweet_savory: 0.5, herby_umami: 0.9, crunchy_soft: 0.2 },
    url: 'https://example.com/thai-curry',
    image_url: 'https://example.com/thai-curry.jpg'
  },
  {
    id: '4',
    name: 'Peanut Butter Sandwich',
    cuisine: 'American',
    diet_tags: ['vegetarian'],
    allergens: ['peanuts', 'gluten'],
    spice: 0,
    macros: { kcal: 320, protein: 12, carbs: 35, fat: 16 },
    taste: { sweet_savory: 0.8, herby_umami: 0.2, crunchy_soft: 0.6 },
    url: 'https://example.com/pb-sandwich',
    image_url: 'https://example.com/pb-sandwich.jpg'
  },
  {
    id: '5',
    name: 'High Protein Chicken Breast',
    cuisine: 'American',
    diet_tags: ['gluten_free'],
    allergens: [],
    spice: 1,
    macros: { kcal: 300, protein: 45, carbs: 5, fat: 8 },
    taste: { sweet_savory: 0.2, herby_umami: 0.7, crunchy_soft: 0.5 },
    url: 'https://example.com/chicken-breast',
    image_url: 'https://example.com/chicken-breast.jpg'
  }
]

describe('rankDishes', () => {
  describe('allergy exclusion', () => {
    it('should exclude dishes with allergens that match user allergies', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: ['peanuts'],
        cuisines: { 'American': 0.8 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Should not include peanut butter sandwich
      expect(results.find(dish => dish.id === '4')).toBeUndefined()
      // Should include other dishes
      expect(results.length).toBeGreaterThan(0)
    })

    it('should exclude dishes with multiple allergen conflicts', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: ['soy', 'dairy'],
        cuisines: {},
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Should exclude chicken teriyaki (soy) and thai curry (dairy)
      expect(results.find(dish => dish.id === '1')).toBeUndefined()
      expect(results.find(dish => dish.id === '3')).toBeUndefined()
    })
  })

  describe('vegan compatibility', () => {
    it('should only include vegan dishes for vegan users', () => {
      const profile = {
        diet_tags: ['vegan'],
        allergy_tags: [],
        cuisines: { 'American': 0.8 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Should only include vegan buddha bowl
      expect(results.length).toBe(1)
      expect(results[0].id).toBe('2')
      expect(results[0].name).toBe('Vegan Buddha Bowl')
    })

    it('should exclude dairy for vegan users even if not in allergens', () => {
      const veganDish = {
        id: 'vegan1',
        name: 'Vegan Pasta',
        cuisine: 'Italian',
        diet_tags: ['vegan'],
        allergens: [],
        spice: 0,
        macros: { kcal: 400, protein: 12, carbs: 60, fat: 10 },
        taste: { sweet_savory: 0.4, herby_umami: 0.6, crunchy_soft: 0.3 },
        url: 'https://example.com/vegan-pasta',
        image_url: 'https://example.com/vegan-pasta.jpg'
      }

      const nonVeganDish = {
        id: 'nonvegan1',
        name: 'Cheese Pizza',
        cuisine: 'Italian',
        diet_tags: ['vegetarian'],
        allergens: ['dairy', 'gluten'],
        spice: 0,
        macros: { kcal: 450, protein: 18, carbs: 50, fat: 20 },
        taste: { sweet_savory: 0.4, herby_umami: 0.6, crunchy_soft: 0.7 },
        url: 'https://example.com/cheese-pizza',
        image_url: 'https://example.com/cheese-pizza.jpg'
      }

      const profile = {
        diet_tags: ['vegan'],
        allergy_tags: [],
        cuisines: { 'Italian': 0.9 },
        spice: 0,
        sweet_savory: 0.4,
        herby_umami: 0.6,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, [veganDish, nonVeganDish])
      
      // Should only include vegan dish
      expect(results.length).toBe(1)
      expect(results[0].id).toBe('vegan1')
    })
  })

  describe('spice and taste influence', () => {
    it('should prefer dishes with matching spice levels', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'Thai': 0.8, 'American': 0.8 },
        spice: 0, // Prefers mild food
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Buddha bowl (spice: 0) should score higher than Thai curry (spice: 4)
      const buddhaBowl = results.find(dish => dish.id === '2')
      const thaiCurry = results.find(dish => dish.id === '3')
      
      if (buddhaBowl && thaiCurry) {
        expect(buddhaBowl.score).toBeGreaterThan(thaiCurry.score)
      }
    })

    it('should prefer dishes with similar taste profiles', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'Japanese': 0.8, 'American': 0.8 },
        spice: 1,
        sweet_savory: 0.7, // Prefers sweet-savory like teriyaki
        herby_umami: 0.8,
        crunchy_soft: 0.3,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Chicken teriyaki should score well due to taste similarity
      const teriyaki = results.find(dish => dish.id === '1')
      expect(teriyaki).toBeDefined()
      expect(teriyaki!.score).toBeGreaterThan(50) // Should get good taste score
    })
  })

  describe('goals bonuses', () => {
    it('should boost high-protein dishes for muscle gain goal', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'American': 0.5 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: ['muscle_gain'],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // High protein chicken breast (45g protein) should score well
      const chickenBreast = results.find(dish => dish.id === '5')
      expect(chickenBreast).toBeDefined()
      expect(chickenBreast!.reason).toContain('high protein for muscle gain')
    })

    it('should boost low-calorie dishes for weight loss goal', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'American': 0.5 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: ['weight_loss'],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Dishes under 550 calories should get bonus
      const lowCalDishes = results.filter(dish => 
        mockDishes.find(d => d.id === dish.id)!.macros.kcal <= 550
      )
      
      expect(lowCalDishes.length).toBeGreaterThan(0)
      lowCalDishes.forEach(dish => {
        expect(dish.reason).toContain('low calorie for weight loss')
      })
    })

    it('should boost balanced dishes for balanced goal', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'Japanese': 0.5, 'Thai': 0.5 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: ['balanced'],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Dishes between 400-750 calories should get bonus
      const balancedDishes = results.filter(dish => {
        const originalDish = mockDishes.find(d => d.id === dish.id)!
        return originalDish.macros.kcal >= 400 && originalDish.macros.kcal <= 750
      })
      
      expect(balancedDishes.length).toBeGreaterThan(0)
      balancedDishes.forEach(dish => {
        expect(dish.reason).toContain('balanced nutrition')
      })
    })
  })

  describe('excludes functionality', () => {
    it('should exclude dishes with excluded ingredients in name', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'American': 0.8 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: ['chicken'] // Exclude anything with chicken
      }

      const results = rankDishes(profile, mockDishes)
      
      // Should exclude chicken teriyaki and chicken breast
      expect(results.find(dish => dish.id === '1')).toBeUndefined()
      expect(results.find(dish => dish.id === '5')).toBeUndefined()
      // Should include non-chicken dishes
      expect(results.find(dish => dish.id === '2')).toBeDefined()
    })
  })

  describe('cuisine preferences', () => {
    it('should boost dishes from preferred cuisines', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'Japanese': 0.9 }, // Strong preference for Japanese
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)

      // Japanese dish should score well
      const japaneseDish = results.find(dish => dish.id === '1')
      expect(japaneseDish).toBeDefined()
      expect(japaneseDish!.reason).toContain('matches your Japanese preference')
    })
  })

  describe('score limits and ranking', () => {
    it('should return at most 10 dishes', () => {
      const manyDishes = Array.from({ length: 20 }, (_, i) => ({
        id: `dish-${i}`,
        name: `Dish ${i}`,
        cuisine: 'American',
        diet_tags: [],
        allergens: [],
        spice: 0,
        macros: { kcal: 400, protein: 20, carbs: 40, fat: 15 },
        taste: { sweet_savory: 0.5, herby_umami: 0.5, crunchy_soft: 0.5 },
        url: `https://example.com/dish-${i}`,
        image_url: `https://example.com/dish-${i}.jpg`
      }))

      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'American': 0.8 },
        spice: 0,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, manyDishes)
      expect(results.length).toBeLessThanOrEqual(10)
    })

    it('should sort results by score in descending order', () => {
      const profile = {
        diet_tags: [],
        allergy_tags: [],
        cuisines: { 'Japanese': 0.9, 'American': 0.5 },
        spice: 1,
        sweet_savory: 0.5,
        herby_umami: 0.5,
        crunchy_soft: 0.5,
        budget: '$$',
        goals: [],
        excludes: []
      }

      const results = rankDishes(profile, mockDishes)
      
      // Verify scores are in descending order
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })
  })
})

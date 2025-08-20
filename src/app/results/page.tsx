'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { analytics } from '@/lib/analytics'

type Recipe = {
  id: string
  title: string
  description: string
  cookTime: string
  difficulty: string
  cuisine: string
  tags: string[]
}

export default function Results() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    analytics.page('Results')
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recs')
      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
        analytics.track('recommendation_viewed', { count: data.recipes?.length || 0 })
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      // Fallback mock data
      setRecipes([
        {
          id: '1',
          title: 'Spicy Thai Basil Chicken',
          description: 'A quick and flavorful stir-fry with fresh basil and chilies',
          cookTime: '20 mins',
          difficulty: 'Easy',
          cuisine: 'Thai',
          tags: ['Spicy', 'Quick', 'Protein']
        },
        {
          id: '2',
          title: 'Mediterranean Quinoa Bowl',
          description: 'Healthy bowl with quinoa, vegetables, and tahini dressing',
          cookTime: '25 mins',
          difficulty: 'Easy',
          cuisine: 'Mediterranean',
          tags: ['Healthy', 'Vegetarian', 'Bowl']
        },
        {
          id: '3',
          title: 'Classic Margherita Pizza',
          description: 'Homemade pizza with fresh mozzarella and basil',
          cookTime: '45 mins',
          difficulty: 'Medium',
          cuisine: 'Italian',
          tags: ['Vegetarian', 'Comfort Food']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (recipeId: string) => {
    const isFavorited = favorites.has(recipeId)
    
    try {
      const response = await fetch('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeId, 
          action: isFavorited ? 'remove' : 'add' 
        })
      })

      if (response.ok) {
        setFavorites(prev => {
          const updated = new Set(prev)
          if (isFavorited) {
            updated.delete(recipeId)
            analytics.track('recipe_unfavorited', { recipeId })
          } else {
            updated.add(recipeId)
            analytics.track('recipe_favorited', { recipeId })
          }
          return updated
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-300">Generating your personalized recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Your Personalized Recipes</h1>
          <p className="text-gray-300 text-lg">
            Based on your preferences, here are some recipes we think you'll love
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-gray-900 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">{recipe.title}</h3>
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className={`p-2 rounded-full transition-colors ${
                    favorites.has(recipe.id) 
                      ? 'text-red-500 hover:text-red-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-300">{recipe.description}</p>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>{recipe.cookTime}</span>
                <span>{recipe.difficulty}</span>
                <span>{recipe.cuisine}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <button 
                className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                onClick={() => analytics.track('recommendation_clicked', { recipeId: recipe.id })}
              >
                View Recipe
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Link 
              href="/chat"
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Chat with AI Chef
            </Link>
            <Link 
              href="/quiz"
              className="border border-gray-600 px-6 py-3 rounded-lg hover:border-gray-400 transition-colors"
            >
              Retake Quiz
            </Link>
          </div>
          
          <p className="text-sm text-gray-400">
            Want more recommendations? Chat with our AI chef for personalized suggestions!
          </p>
        </div>
      </div>
    </div>
  )
}

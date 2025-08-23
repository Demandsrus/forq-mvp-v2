'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { RestaurantCard } from '@/components/RestaurantCard'
import { resolveContext, inferTimeOfDay } from '@/lib/context'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentUserId } from '@/lib/auth'

interface Restaurant {
  restaurant: {
    id: string
    name: string
    platform: string
    image_url: string
    address: string
    city: string
    state: string
    postal_code: string
    hours: any
    atmosphere: string
    rating: number
    review_count: number
    platform_badge: string
  }
  overview: {
    summary: string
    hours: any
    atmosphere: string
  }
  recommended_items: Array<{
    id: string
    name: string
    macros: any
    spice: number
    price_cents: number
    url: string
    reason: string
    score: number
  }>
  reviews_preview: Array<{
    stars: number
    text: string
  }>
  reservation: {
    available: boolean
    url: string | null
  }
  checkout: {
    platform: string
    deeplink: string
  }
}

export default function DiscoverPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sanitized, setSanitized] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    loadRestaurants()
    
    // Track page view
    analytics.track('discover_view', {
      timestamp: new Date().toISOString(),
      time_of_day: inferTimeOfDay()
    })
  }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      setError('')

      // Get current user ID (authenticated or anonymous)
      const userId = await getCurrentUserId()

      // Get user preferences if available
      let userPreferences = null
      if (isAuthenticated && user?.preferences) {
        userPreferences = user.preferences
      } else {
        // Try to get from localStorage for anonymous users
        const savedQuiz = localStorage.getItem('forq_quiz_responses')
        if (savedQuiz) {
          try {
            userPreferences = JSON.parse(savedQuiz)
          } catch (e) {
            console.warn('Failed to parse saved quiz responses')
          }
        }
      }

      // Get current context
      const context = resolveContext({
        time_of_day: inferTimeOfDay(),
        topK: 5,
        user_preferences: userPreferences
      })

      const response = await fetch('/api/restaurants/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load restaurants')
      }

      const data = await response.json()
      setRestaurants(data.results || [])
      setSanitized(data.sanitized || false)
    } catch (err) {
      setError('Failed to load restaurants. Please try again.')
      console.error('Error loading restaurants:', err)

      // Fallback mock data for development
      setRestaurants([
        {
          restaurant: {
            id: 'mock1',
            name: 'Tony\'s Pizza Palace',
            platform: 'ubereats',
            image_url: '/placeholder-restaurant.svg',
            address: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94102',
            hours: { mon: [['11:00', '22:00']] },
            atmosphere: 'Casual dining',
            rating: 4.5,
            review_count: 150,
            platform_badge: '/assets/platforms/ubereats.svg'
          },
          overview: {
            summary: 'Authentic Italian pizza with fresh ingredients',
            hours: { mon: [['11:00', '22:00']] },
            atmosphere: 'Casual dining'
          },
          recommended_items: [
            {
              id: 'item1',
              name: 'Margherita Pizza',
              macros: { kcal: 800, protein: 30, carbs: 100, fat: 25 },
              spice: 1,
              price_cents: 1599,
              url: 'https://ubereats.com/item1',
              reason: 'Perfect classic choice',
              score: 85
            }
          ],
          reviews_preview: [
            { stars: 5, text: 'Amazing pizza!' },
            { stars: 4, text: 'Great atmosphere' }
          ],
          reservation: {
            available: false,
            url: null
          },
          checkout: {
            platform: 'ubereats',
            deeplink: 'https://ubereats.com/restaurant/tonys-pizza'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Discover Restaurants</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#121212] rounded-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Discover Restaurants</h1>
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
          <button
            onClick={loadRestaurants}
            className="mt-4 bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Restaurants</h1>
          <p className="text-gray-400">
            Personalized recommendations for {inferTimeOfDay()}
          </p>
          {sanitized && (
            <div className="mt-2 text-sm text-gray-500 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-800">
              ℹ️ Showing delivery options (FORQ doesn't provide recipes or benefits info).
            </div>
          )}
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No restaurants found in your area.</p>
            <button
              onClick={loadRestaurants}
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

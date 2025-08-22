'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { RestaurantCard } from '@/components/RestaurantCard'
import { resolveContext, inferTimeOfDay } from '@/lib/context'

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

      // Get current context
      const context = resolveContext({
        time_of_day: inferTimeOfDay(),
        topK: 5
      })

      const response = await fetch('/api/restaurants/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'anonymous', // TODO: Get from auth
          context
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load restaurants')
      }

      const data = await response.json()
      setRestaurants(data.results || [])
    } catch (err) {
      setError('Failed to load restaurants. Please try again.')
      console.error('Error loading restaurants:', err)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

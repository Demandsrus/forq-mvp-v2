'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

export default function Home() {
  useEffect(() => {
    analytics.page('Home')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">
          FORQ
        </h1>

        <p className="text-xl text-gray-300 leading-relaxed">
          Premium food delivery with EBT/SNAP support and AI-powered recommendations.
          Order from the best restaurants in your area.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => analytics.track('cta_clicked', { location: 'home', action: 'signup' })}
            >
              Get Started
            </Link>

            <Link
              href="/discover"
              className="inline-block bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors border border-gray-600"
              onClick={() => analytics.track('cta_clicked', { location: 'home', action: 'discover' })}
            >
              Discover Restaurants
            </Link>
          </div>

          <div className="text-gray-400">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-white underline hover:text-gray-300"
              onClick={() => analytics.track('cta_clicked', { location: 'home', action: 'signin' })}
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold">EBT/SNAP Support</h3>
              <p className="text-gray-400 text-sm">
                Use your benefits to order fresh, healthy meals from local restaurants.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">AI Assistant Edith</h3>
              <p className="text-gray-400 text-sm">
                Get personalized food recommendations and customer support.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Premium Experience</h3>
              <p className="text-gray-400 text-sm">
                Tesla-inspired design with fast delivery and quality service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
          Your AI-powered food assistant. Discover personalized recipes,
          get cooking guidance, and explore flavors tailored just for you.
        </p>

        <div className="space-y-4">
          <Link
            href="/quiz"
            className="inline-block bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            onClick={() => analytics.track('cta_clicked', { location: 'home', action: 'start_quiz' })}
          >
            Start Your Food Journey
          </Link>

          <div className="text-sm text-gray-400">
            Takes 2 minutes • Get instant recommendations
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <Link href="/chat" className="hover:text-white transition-colors">
              Chat with AI
            </Link>
            <Link href="/account" className="hover:text-white transition-colors">
              Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

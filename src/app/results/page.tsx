'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'

export default function Results() {
  const router = useRouter()

  useEffect(() => {
    // Track the redirect for analytics
    analytics.track('results_page_redirect', {
      from: '/results',
      to: '/discover',
      reason: 'guardrails_redirect'
    })

    // Redirect to discover page (restaurants instead of recipes)
    router.replace('/discover')
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to restaurant discovery...</p>
      </div>
    </div>
  )
}

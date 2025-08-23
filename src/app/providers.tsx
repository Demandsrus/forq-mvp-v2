'use client'

import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog only on client side
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        import('@/lib/analytics').then(({ initPostHog }) => {
          try {
            initPostHog()
          } catch (error) {
            console.warn('PostHog initialization error:', error)
          }
        }).catch((error) => {
          console.warn('Failed to load analytics module:', error)
        })
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [])

  return <>{children}</>
}

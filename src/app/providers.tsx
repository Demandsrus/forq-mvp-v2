'use client'

import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog only on client side
    if (typeof window !== 'undefined') {
      import('@/lib/analytics').then(({ initPostHog }) => {
        initPostHog()
      }).catch((error) => {
        console.warn('Failed to initialize analytics:', error)
      })
    }
  }, [])

  return <>{children}</>
}

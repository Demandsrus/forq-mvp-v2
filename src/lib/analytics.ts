import { PostHog } from 'posthog-node'

// Client-side PostHog instance (lazy loaded)
let posthogClient: any = null

export const initPostHog = () => {
  if (typeof window !== 'undefined' && !posthogClient) {
    // Dynamic import for client-side only
    import('posthog-js').then((posthog) => {
      posthogClient = posthog.default
      posthogClient.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog initialized')
          }
        }
      })
    })
  }
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics track:', event, properties)
    }

    // Send to PostHog if available
    if (posthogClient) {
      posthogClient.capture(event, properties)
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics identify:', userId, properties)
    }

    if (posthogClient) {
      posthogClient.identify(userId, properties)
    }
  },

  page: (name?: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics page:', name, properties)
    }

    if (posthogClient) {
      posthogClient.capture('$pageview', {
        $current_url: window.location.href,
        page_name: name,
        ...properties
      })
    }
  }
}

// Server-side analytics helper
export const getServerAnalytics = async () => {
  if (!process.env.POSTHOG_KEY) {
    return null
  }

  return new PostHog(process.env.POSTHOG_KEY, {
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com'
  })
}

// Event types for type safety
export type AnalyticsEvent =
  | 'quiz_started'
  | 'quiz_completed'
  | 'recipe_favorited'
  | 'recipe_unfavorited'
  | 'chat_message_sent'
  | 'recommendation_viewed'
  | 'recommendation_clicked'
  | 'restaurants_search'
  | 'signup_attempted'
  | 'signup_completed'
  | 'signin_attempted'
  | 'signin_completed'
  | 'cta_clicked'
  | 'checkout_started'
  | 'reservation_attempted'
  | 'discover_view'
  | 'restaurant_card_open'
  | 'restaurant_checkout_click'
  | 'restaurant_reserve_click'

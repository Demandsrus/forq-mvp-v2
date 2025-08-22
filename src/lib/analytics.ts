// Simple analytics stub (PostHog removed for deployment)
export const initPostHog = () => {
  // No-op for now
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics track:', event, properties)
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics identify:', userId, properties)
    }
  },

  page: (name?: string, properties?: Record<string, any>) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics page:', name, properties)
    }
  }
}

// Server-side analytics helper (disabled for now to fix deployment)
export const getServerAnalytics = async () => {
  // Temporarily disabled to fix Vercel deployment
  return null
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

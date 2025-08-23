'use client'

import { createClient } from '@supabase/supabase-js'
import { Database } from '../../types/db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  full_name?: string
  created_at: string
  quiz_completed?: boolean
  preferences?: any
}

export type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error

      // Create user profile in our users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            created_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      if (!user) return { user: null, error: null }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        return { user: null, error: profileError.message }
      }

      return { user: profile, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Save quiz responses
  saveQuizResponses: async (userId: string, responses: any) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          preferences: responses,
          quiz_completed: true
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user } = await authHelpers.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

// Generate anonymous user ID for non-authenticated users
export const getAnonymousUserId = () => {
  if (typeof window === 'undefined') return 'anonymous'
  
  let anonymousId = localStorage.getItem('forq_anonymous_id')
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('forq_anonymous_id', anonymousId)
  }
  return anonymousId
}

// Get current user ID (authenticated or anonymous)
export const getCurrentUserId = async () => {
  const { user } = await authHelpers.getCurrentUser()
  return user?.id || getAnonymousUserId()
}

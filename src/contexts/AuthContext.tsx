'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authHelpers, User, AuthState } from '@/lib/auth'
import { analytics } from '@/lib/analytics'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  saveQuizResponses: (responses: any) => Promise<{ success: boolean; error?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const { user, error } = await authHelpers.getCurrentUser()
        setState({
          user,
          loading: false,
          error: error || null
        })

        if (user) {
          analytics.identify(user.id, {
            email: user.email,
            full_name: user.full_name,
            quiz_completed: user.quiz_completed
          })
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: 'Failed to initialize authentication'
        })
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange((user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false
      }))

      if (user) {
        analytics.identify(user.id, {
          email: user.email,
          full_name: user.full_name,
          quiz_completed: user.quiz_completed
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    analytics.track('signup_attempted', { email })
    
    const { data, error } = await authHelpers.signUp(email, password, fullName)
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      return { success: false, error }
    }

    analytics.track('signup_completed', { 
      email,
      user_id: data?.user?.id 
    })

    setState(prev => ({ ...prev, loading: false }))
    return { success: true }
  }

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    analytics.track('signin_attempted', { email })
    
    const { data, error } = await authHelpers.signIn(email, password)
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      return { success: false, error }
    }

    analytics.track('signin_completed', { 
      email,
      user_id: data?.user?.id 
    })

    setState(prev => ({ ...prev, loading: false }))
    return { success: true }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    analytics.track('signout', { user_id: state.user?.id })
    
    await authHelpers.signOut()
    
    setState({
      user: null,
      loading: false,
      error: null
    })
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' }
    }

    setState(prev => ({ ...prev, loading: true }))
    
    const { data, error } = await authHelpers.updateProfile(state.user.id, updates)
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      return { success: false, error }
    }

    setState(prev => ({
      ...prev,
      user: data,
      loading: false
    }))

    analytics.track('profile_updated', { 
      user_id: state.user.id,
      updates: Object.keys(updates)
    })

    return { success: true }
  }

  const saveQuizResponses = async (responses: any) => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' }
    }

    setState(prev => ({ ...prev, loading: true }))
    
    const { data, error } = await authHelpers.saveQuizResponses(state.user.id, responses)
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      return { success: false, error }
    }

    setState(prev => ({
      ...prev,
      user: data,
      loading: false
    }))

    analytics.track('quiz_responses_saved', { 
      user_id: state.user.id,
      responses
    })

    return { success: true }
  }

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    saveQuizResponses,
    isAuthenticated: !!state.user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

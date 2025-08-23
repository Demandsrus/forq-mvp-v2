'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { analytics } from '@/lib/analytics'

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const { signUp, loading, error } = useAuth()
  const [localError, setLocalError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    try {
      const { success, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      )

      if (success) {
        analytics.track('signup_completed', {
          email: formData.email
        })

        // Redirect to quiz or discover page
        router.push('/quiz')
      } else if (signUpError) {
        setLocalError(signUpError)
      }
    } catch (err) {
      setLocalError('An unexpected error occurred')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-8" style={{ fontSize: '28pt', marginTop: '100px' }}>
            FORQ
          </h1>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {error || localError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-[#1A1A1A] text-white placeholder-gray-400 rounded-lg border border-transparent focus:border-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-[#1A1A1A] text-white placeholder-gray-400 rounded-lg border border-transparent focus:border-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-[#1A1A1A] text-white placeholder-gray-400 rounded-lg border border-transparent focus:border-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-[#1A1A1A] text-white placeholder-gray-400 rounded-lg border border-transparent focus:border-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="text-sm text-gray-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-white underline hover:text-gray-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-white underline hover:text-gray-300">
              Privacy Policy
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-white underline hover:text-gray-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

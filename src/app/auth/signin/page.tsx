'use client'

import { useState } from 'react'
import Link from 'next/link'
import { analytics } from '@/lib/analytics'

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    analytics.track('signin_attempted', { email: formData.email })
    // TODO: Implement signin logic
    console.log('Signin attempted:', formData)
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
          <h1 className="text-4xl font-bold tracking-tight mb-8" style={{ fontSize: '28pt', marginTop: '85px' }}>
            FORQ
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-gray-400 hover:text-white">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            SIGN IN
          </button>
        </form>

        <div className="text-center text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-white underline hover:text-gray-300">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

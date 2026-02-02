'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'

export default function SignupPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLinkedInSignup = async () => {
    setError('')
    setLoading(true)

    const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/home'
      : 'https://clientdining.com/home'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: redirectUrl,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-light text-zinc-900">Join ClientDining</h1>
          <p className="mt-2 text-zinc-600 font-light">Professional dining for City professionals</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-light">
              {error}
            </div>
          )}

          {/* LinkedIn Signup Button */}
          <button
            onClick={handleLinkedInSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#0A66C2] text-white py-3 rounded-lg hover:bg-[#004182] transition-colors disabled:opacity-50 font-light"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with LinkedIn'}
          </button>

          {/* Why LinkedIn explanation */}
          <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
            <h3 className="text-sm font-light text-zinc-900 mb-2">Why LinkedIn?</h3>
            <p className="text-sm text-zinc-600 font-light leading-relaxed">
              ClientDining is an exclusive network for verified City professionals. 
              LinkedIn allows us to confirm your professional status quickly and discreetly, 
              maintaining the quality and integrity of our community.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-zinc-600 font-light">
            Already have an account?{' '}
            <Link href="/login" className="font-light text-zinc-900 hover:underline">
              Login
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500 font-light">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-zinc-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-zinc-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

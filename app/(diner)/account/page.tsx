'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, authLoading, router])

  const loadProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error loading profile:', error)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleUpgrade = async () => {
    setUpgrading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

// Redirect to Stripe Checkout
if (data.url) {
  window.location.href = data.url
}
    } catch (error: any) {
      console.error('Upgrade error:', error)
      alert('Failed to start checkout: ' + error.message)
    } finally {
      setUpgrading(false)
    }
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>
  }

  const isFree = profile.tier === 'free'
  const isPremium = profile.tier === 'premium'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and subscription</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="text-gray-900">{profile.full_name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <p className="text-gray-900">{profile.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Member Since</label>
            <p className="text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{profile.tier}</p>
          </div>
          {isPremium && (
            <span className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium">
              Active
            </span>
          )}
        </div>

        {isFree && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upgrade to Premium - £49/month</h3>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li>✓ Book premium restaurant slots in advance</li>
                <li>✓ Up to 10 future bookings (vs 3 on free)</li>
                <li>✓ Priority alert notifications</li>
                <li>✓ Access to exclusive venues</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
              >
                {upgrading ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            </div>

            <div className="text-xs text-gray-500">
              <p>• Cancel anytime</p>
              <p>• Billed monthly</p>
              <p>• Instant access after upgrade</p>
            </div>
          </div>
        )}

        {isPremium && (
          <div className="text-sm text-gray-600">
            <p>You have full access to all premium features.</p>
            <p className="mt-2">To manage your subscription, contact support@clientdining.com</p>
          </div>
        )}
      </div>

      {/* Booking Limits */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Limits</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Maximum future bookings</span>
            <span className="font-medium text-gray-900">{isFree ? '3' : '10'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Can book premium slots</span>
            <span className="font-medium text-gray-900">{isPremium ? 'Yes' : 'Within 24h only'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

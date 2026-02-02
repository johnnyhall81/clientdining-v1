'use client'



import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
      .eq('user_id', user.id)
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

      const stripe = await stripePromise
      if (stripe && data.url) {
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
    return <div className="flex items-center justify-center min-h-[400px] text-zinc-500 font-light">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center py-12 text-zinc-500 font-light">Profile not found</div>
  }

  const isFree = profile.diner_tier === 'free'
  const isPremium = profile.diner_tier === 'premium'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light text-zinc-900">Account Settings</h1>
        <p className="text-zinc-600 font-light mt-2">Manage your account and subscription</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <h2 className="text-xl font-light text-zinc-900 mb-4">Profile Information</h2>
        
        <div className="flex items-start gap-6">
          {/* Avatar */}
          {profile.avatar_url ? (
            <div className="relative w-20 h-20">
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || 'Profile'}
                fill
                sizes="80px"
                quality={70}
                className="rounded-full object-cover border-2 border-zinc-200"
              />
            </div>

          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-2xl font-light text-zinc-600">
              {profile.full_name?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-sm text-zinc-600 font-light">Name</label>
              <p className="text-zinc-900 font-light">{profile.full_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-zinc-600 font-light">Email</label>
              <p className="text-zinc-900 font-light">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm text-zinc-600 font-light">Member Since</label>
              <p className="text-zinc-900 font-light">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <h2 className="text-xl font-light text-zinc-900 mb-4">Subscription</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-zinc-600 font-light">Current Plan</p>
            <p className="text-2xl font-light text-zinc-900 capitalize">{profile.diner_tier}</p>
          </div>
          {isPremium && (
            <span className="px-4 py-2 bg-zinc-900 text-zinc-50 rounded-lg font-light">
              Active
            </span>
          )}
        </div>

        {isFree && (
          <div className="space-y-4">
            <div className="bg-zinc-50 rounded-lg p-4">
              <h3 className="font-light text-zinc-900 mb-3">Upgrade to Premium - £49/month</h3>
              <ul className="space-y-2 text-sm text-zinc-700 font-light mb-4">
                <li>✓ Book premium restaurant slots in advance</li>
                <li>✓ Up to 10 future bookings (vs 3 on free)</li>
                <li>✓ Priority alert notifications</li>
                <li>✓ Access to exclusive venues</li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-zinc-900 text-zinc-50 py-3 rounded-lg hover:bg-zinc-800 disabled:opacity-50 font-light"
              >
                {upgrading ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            </div>

            <div className="text-xs text-zinc-500 font-light">
              <p>• Cancel anytime</p>
              <p>• Billed monthly</p>
              <p>• Instant access after upgrade</p>
            </div>
          </div>
        )}

        {isPremium && (
          <div className="text-sm text-zinc-600 font-light">
            <p>You have full access to all premium features.</p>
            <p className="mt-2">To manage your subscription, contact support@clientdining.com</p>
          </div>
        )}
      </div>

      {/* Booking Limits */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <h2 className="text-xl font-light text-zinc-900 mb-4">Booking Limits</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600 font-light">Maximum future bookings</span>
            <span className="font-light text-zinc-900">{isFree ? '3' : '10'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 font-light">Can book premium slots</span>
            <span className="font-light text-zinc-900">{isPremium ? 'Yes' : 'Within 24h only'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import NominationCard from '@/components/account/NominationCard'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-zinc-500 font-light">Loading...</div>
  }

  if (!profile) {
    return <div className="text-center py-12 text-zinc-500 font-light">Profile not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light text-zinc-900">Account</h1>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <h2 className="text-xl font-light text-zinc-900 mb-4">Profile</h2>
        <div className="flex items-start gap-6">
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
              <label className="text-sm text-zinc-600 font-light">Member since</label>
              <p className="text-zinc-900 font-light">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nominations - only shows if enabled for this user */}
      <NominationCard />
    </div>
  )
}

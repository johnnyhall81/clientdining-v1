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

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const displayName = profile.full_name
    ? profile.full_name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light text-zinc-900">Account</h1>
      </div>

      {/* Profile card — no heading, more breathing room */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-8">
        <div className="flex items-center gap-8">
          {/* Avatar */}
          {profile.avatar_url ? (
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={profile.avatar_url}
                alt={displayName || 'Profile'}
                fill
                sizes="64px"
                quality={70}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-light text-zinc-500 flex-shrink-0">
              {(displayName || profile.email)?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Details */}
          <div className="flex-1 space-y-2">
            {displayName && (
              <p className="text-zinc-900 font-light">{displayName}</p>
            )}
            <p className="text-sm font-light text-zinc-500">{profile.email}</p>
            <p className="text-sm font-light text-zinc-400">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Introduce */}
      <div className="pt-8">
        <NominationCard userId={user!.id} canNominate={profile.can_nominate || false} />
      </div>
    </div>
  )
}

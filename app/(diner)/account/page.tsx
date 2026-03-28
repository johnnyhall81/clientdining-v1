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
    if (user) loadProfile()
  }, [user, authLoading, router])

  const loadProfile = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (!error) setProfile(data)
    setLoading(false)
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px] text-zinc-400 font-light text-sm">Loading…</div>
  }

  if (!profile) {
    return <div className="text-center py-12 text-zinc-400 font-light text-sm">Profile not found</div>
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const displayName = profile.full_name
    ? profile.full_name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-0">

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-zinc-100 px-7 py-6">
        <div className="flex items-center gap-5">

          {/* Avatar */}
          {profile.avatar_url ? (
            <div className="relative w-11 h-11 flex-shrink-0">
              <Image
                src={profile.avatar_url}
                alt={displayName || 'Profile'}
                fill
                sizes="44px"
                quality={70}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-base font-light text-zinc-400 flex-shrink-0">
              {(displayName || profile.email)?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            {displayName && (
              <p className="text-sm font-light text-zinc-900 leading-snug">{displayName}</p>
            )}
            <p className="text-xs font-light text-zinc-400 mt-0.5 truncate">{profile.email}</p>
          </div>

          {/* Right side — status + member since */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`text-[9px] tracking-[0.15em] uppercase font-light px-2.5 py-1 rounded-full ${
              profile.is_professionally_verified
                ? 'text-zinc-500 bg-zinc-100'
                : 'text-amber-600 bg-amber-50'
            }`}>
              {profile.is_professionally_verified ? 'Verified member' : 'Pending verification'}
            </span>
            <p className="text-[10px] font-light text-zinc-300">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Nominations */}
      {profile.can_nominate && (
        <NominationCard userId={user!.id} canNominate={profile.can_nominate || false} />
      )}

    </div>
  )
}

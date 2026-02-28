'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Account header — no card, editorial */}
      <div>
        <h1 className="text-3xl font-light text-zinc-900">Account</h1>
        <p className="text-sm font-light text-zinc-400 mt-1">
          {profile.full_name
            ? profile.full_name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
            : profile.email}
          {' · '}{profile.email}
          {' · '}Member since {memberSince}
        </p>
      </div>

      {/* Introduce section */}
      <div className="pt-8">
        <NominationCard userId={user!.id} canNominate={profile.can_nominate || false} />
      </div>

    </div>
  )
}

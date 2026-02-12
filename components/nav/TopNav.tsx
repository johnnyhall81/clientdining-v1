'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [bookingCount, setBookingCount] = useState(0)
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadProfile()
      loadCounts()
      
      // Set up real-time subscriptions
      const bookingsChannel = supabase
        .channel('bookings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${user.id}`,
          },
          () => loadCounts()
        )
        .subscribe()

      const alertsChannel = supabase
        .channel('alerts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'slot_alerts',
            filter: `diner_user_id=eq.${user.id}`,
          },
          () => loadCounts()
        )
        .subscribe()

      // Cleanup subscriptions
      return () => {
        bookingsChannel.unsubscribe()
        alertsChannel.unsubscribe()
      }
    } else {
      setBookingCount(0)
      setAlertCount(0)
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('user_id', user.id)
      .single()
    setProfile(data)
  }

  const loadCounts = async () => {
    if (!user) return

    // Get active future bookings count
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, slot_id, status, slots(start_at)')
      .eq('user_id', user.id)
      .eq('status', 'active')
    
    // Filter for future bookings
    const futureBookings = bookings?.filter(b => {
      const slot = Array.isArray(b.slots) ? b.slots[0] : b.slots
      const slotStartAt = slot?.start_at
      return slotStartAt && new Date(slotStartAt) >= new Date()
    }) || []

    setBookingCount(futureBookings.length)

    // Get active and notified alerts count
    const { data: alerts } = await supabase
      .from('slot_alerts')
      .select('id')
      .eq('diner_user_id', user.id)
      .in('status', ['active', 'notified'])

    setAlertCount(alerts?.length || 0)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path
  const isAdmin = profile?.role === 'platform_admin'

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/home" : "/"} className="text-xl font-light text-zinc-900 flex-shrink-0">
            ClientDining
          </Link>

          {/* Navigation */}
          {user ? (
            <nav className="flex items-center gap-3 sm:gap-6">
             
             <Link
                href="/search"
                className={`transition-colors ${
                  isActive('/search')
                    ? 'text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <Link
                href="/bookings"
                className={`relative flex items-center gap-1.5 text-sm font-light transition-colors ${
                  isActive('/bookings')
                    ? 'text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Bookings
                {bookingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-light text-zinc-600 bg-zinc-100 rounded-full">
                    {bookingCount}
                  </span>
                )}
              </Link>

              <Link
                href="/alerts"
                className={`relative transition-colors ${
                  isActive('/alerts')
                    ? 'text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                aria-label="Alerts"
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {alertCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-light text-zinc-600 bg-zinc-200 rounded-full">
                      {alertCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Menu with Chevron */}
              <div className="relative group">
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  
                {profile?.avatar_url ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      fill
                      sizes="32px"
                      quality={70}
                      className="rounded-full object-cover border border-zinc-200"
                    />
                  </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-light text-zinc-600">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {!isAdmin && (
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm font-light text-zinc-700 hover:bg-zinc-50 rounded-t-lg"
                    >
                      Account
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm font-light text-zinc-700 hover:bg-zinc-50 rounded-t-lg"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm font-light text-zinc-700 hover:bg-zinc-50 rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-light text-zinc-900 hover:text-zinc-700"
            >
              Login
            </Link>
          </nav>
          )}
        </div>
      </div>
    </header>
  )
}

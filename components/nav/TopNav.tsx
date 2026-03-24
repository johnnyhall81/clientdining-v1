'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [bookingCount, setBookingCount] = useState(0)
  const [alertCount, setAlertCount] = useState(0)

  // Detect venue page
  const venueMatch = pathname.match(/^\/venues\/([^/]+)$/)
  const isVenuePage = !!venueMatch
  const currentTab = searchParams.get('tab') || 'reservations'

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

    // Get active and notified alerts count — future slots only
    const { data: alerts } = await supabase
      .from('slot_alerts')
      .select('id, status, slots(start_at)')
      .eq('diner_user_id', user.id)
      .in('status', ['active', 'notified'])

    const futureAlerts = (alerts || []).filter(a => {
      const slot = Array.isArray(a.slots) ? a.slots[0] : a.slots
      return slot?.start_at && new Date(slot.start_at) > new Date()
    })

    setAlertCount(futureAlerts.length)
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

        {/* Venue page layout: back | tabs | user */}
        {isVenuePage ? (
          <div className="flex items-center justify-between h-16">

            {/* Back */}
            <button
              onClick={() => router.push('/home')}
              className="text-zinc-400 hover:text-zinc-900 transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            {/* Centre tabs — only shown when venue has private hire */}
            <div className="flex items-center gap-1">
              {(['reservations', 'private_hire'] as const).map(tab => (
                <Link
                  key={tab}
                  href={`${pathname}${tab === 'reservations' ? '' : '?tab=private_hire'}`}
                  className="px-4 py-2 text-xs font-light tracking-widest uppercase transition-colors"
                  style={{
                    color: currentTab === tab ? '#18181B' : '#A1A1AA',
                    borderBottom: currentTab === tab ? '2px solid #18181B' : '2px solid transparent',
                  }}
                >
                  {tab === 'reservations' ? 'Book' : 'Hire'}
                </Link>
              ))}
            </div>

            {/* User icon */}
            {user ? (
              <div className="relative group flex-shrink-0">
                <button className="flex items-center hover:opacity-80 transition-opacity">
                  {profile?.avatar_url ? (
                    <div className="relative w-8 h-8">
                      <Image src={profile.avatar_url} alt={profile.full_name || 'Profile'} fill sizes="32px" quality={70} className="rounded-full object-cover border border-zinc-200" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-light text-zinc-500">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/account" className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-t-lg">Account</Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-b-lg">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-zinc-400 hover:text-zinc-900 transition-colors flex-shrink-0">
                <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </Link>
            )}
          </div>

        ) : (
          <div className="flex justify-between items-center h-16">
            <Link href={user ? "/home" : "/"} className="text-xl font-light text-zinc-900 flex-shrink-0">
              ClientDining
            </Link>

            {user ? (
            <nav className="flex items-center gap-3 sm:gap-6">

              <Link
                href="/home"
                className={`transition-colors ${isActive('/home') ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}
                aria-label="Home"
              >
                {isActive('/home') ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                )}
              </Link>

              <Link
                href="/map"
                className={`transition-colors ${
                  isActive('/map')
                    ? 'text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                aria-label="Map"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </Link>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              <Link
                href="/search"
                className={`transition-colors ${
                  isActive('/search')
                    ? 'text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <Link
                href="/bookings"
                className={`relative transition-colors ${
                  isActive('/bookings')
                    ? 'text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-900'
                }`}
                aria-label="Bookings"
              >
                <div className="relative">
                  {isActive('/bookings') ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  )}
                  {bookingCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-light text-zinc-500 bg-zinc-200 rounded-full">
                      {bookingCount}
                    </span>
                  )}
                </div>
              </Link>

              {alertCount > 0 && (
                <Link
                  href="/alerts"
                  className={`relative transition-colors ${
                    isActive('/alerts')
                      ? 'text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  aria-label="Alerts"
                >
                  <div className="relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-light text-zinc-500 bg-zinc-200 rounded-full">
                      {alertCount}
                    </span>
                  </div>
                </Link>
              )}

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
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-light text-zinc-500">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {!isAdmin && (
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-t-lg"
                    >
                      Account
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-t-lg"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-zinc-100" />
              ) : (
                <Link
                  href="/login"
                  className="text-zinc-500 hover:text-zinc-900 transition-colors"
                  aria-label="Sign in"
                >
                  <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:border-zinc-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </Link>
              )}
            </nav>
          )}
          </div>
        )}

      </div>
    </header>
  )
}

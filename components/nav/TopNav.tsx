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
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [bookingCount, setBookingCount] = useState(0)
  const [alertCount, setAlertCount] = useState(0)

  // Detect venue page
  const venueMatch = pathname.match(/^\/venues\/([^/]+)$/)
  const isVenuePage = !!venueMatch
  const venueId = venueMatch?.[1] ?? null
  const currentTab = searchParams.get('tab') || 'reservations'
  const [venueHasPrivateHire, setVenueHasPrivateHire] = useState(false)
  const [venueHireOnly, setVenueHireOnly] = useState(false)

  useEffect(() => {
    if (!venueId) { setVenueHasPrivateHire(false); setVenueHireOnly(false); return }
    supabase
      .from('venues')
      .select('private_hire_available, hire_only')
      .eq('id', venueId)
      .single()
      .then(({ data }) => {
        setVenueHasPrivateHire(data?.private_hire_available ?? false)
        setVenueHireOnly(data?.hire_only ?? false)
      })
  }, [venueId])

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
              className="text-zinc-300 hover:text-zinc-700 transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            {/* Centre tabs */}
            <div className="flex items-center gap-1">
              {venueHireOnly ? (
                <span className="px-4 py-2 text-xs font-light tracking-widest uppercase text-zinc-900">
                  Hire
                </span>
              ) : venueHasPrivateHire ? (
                (['reservations', 'private_hire'] as const).map(tab => (
                  <Link
                    key={tab}
                    href={`${pathname}${tab === 'reservations' ? '' : '?tab=private_hire'}`}
                    className="px-4 py-2 text-xs font-light tracking-widest uppercase transition-colors"
                    style={{
                      color: currentTab === tab ? '#18181B' : '#D4D4D8',
                    }}
                  >
                    {tab === 'reservations' ? 'Book' : 'Hire'}
                  </Link>
                ))
              ) : (
                <span className="px-4 py-2 text-xs font-light tracking-widest uppercase text-zinc-900">
                  Book
                </span>
              )}
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
                  <Link href="/bookings" className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-t-lg">My Bookings</Link>
                  <Link href="/account" className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50">Account</Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-b-lg">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="text-zinc-300 hover:text-zinc-700 transition-colors flex-shrink-0">
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

              {/* Grid/Map toggle — show the opposite of current view */}
              {isActive('/map') ? (
                <Link
                  href="/home"
                  className="text-zinc-300 hover:text-zinc-700 transition-colors"
                  aria-label="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/map"
                  className={`transition-colors ${isActive('/home') ? 'text-zinc-300 hover:text-zinc-700' : 'text-zinc-300 hover:text-zinc-700'}`}
                  aria-label="Map view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </Link>
              )}

              <Link
                href="/search"
                className={`transition-colors ${
                  isActive('/search')
                    ? 'text-zinc-900'
                    : 'text-zinc-300 hover:text-zinc-700'
                }`}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <Link
                href="/private-hire"
                className={`transition-colors ${
                  isActive('/private-hire')
                    ? 'text-zinc-900'
                    : 'text-zinc-300 hover:text-zinc-700'
                }`}
                aria-label="Private hire"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </Link>

              {alertCount > 0 && (
                <Link
                  href="/alerts"
                  className={`relative transition-colors ${
                    isActive('/alerts')
                      ? 'text-zinc-900'
                      : 'text-zinc-300 hover:text-zinc-700'
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
                  <Link
                    href="/bookings"
                    className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50 rounded-t-lg"
                  >
                    My Bookings
                  </Link>
                  {!isAdmin && (
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50"
                    >
                      Account
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm font-light text-zinc-900 hover:bg-zinc-50"
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
              <Link
                href="/login"
                className="text-zinc-300 hover:text-zinc-700 transition-colors"
                aria-label="Sign in"
              >
                <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:border-zinc-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </Link>
            </nav>
          )}
          </div>
        )}

      </div>
    </header>
  )
}

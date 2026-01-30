'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      .select('id, slots!inner(start_at)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('slots.start_at', new Date().toISOString())

    setBookingCount(bookings?.length || 0)

    // Get active alerts count
    const { data: alerts } = await supabase
      .from('slot_alerts')
      .select('id')
      .eq('diner_user_id', user.id)
      .eq('status', 'active')

    setAlertCount(alerts?.length || 0)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path
  const isAdmin = profile?.role === 'platform_admin'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/home" : "/"} className="text-xl font-bold text-gray-900">
            ClientDining
          </Link>

          {/* Navigation */}
          {user ? (
            <nav className="flex items-center gap-6">
              <Link
                href="/search"
                className={`text-sm font-medium transition-colors ${
                  isActive('/search')
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Search
              </Link>
              <Link
                href="/bookings"
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive('/bookings')
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bookings
                {bookingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                    {bookingCount}
                  </span>
                )}
              </Link>
              <Link
                href="/alerts"
                className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive('/alerts')
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Alerts
                {alertCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                    {alertCount}
                  </span>
                )}
              </Link>

              {/* User Menu with Chevron */}
              <div className="relative group">
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {!isAdmin && (
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      Account
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </nav>
          ) : (
            <nav className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                FAQ
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm"
              >
                Sign Up
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

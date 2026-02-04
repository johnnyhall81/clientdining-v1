'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [user, loading])

  const checkAdminAccess = async () => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'platform_admin') {
      router.push('/home')
      return
    }

    setIsAdmin(true)
    setCheckingAuth(false)
  }

  const isActive = (path: string) => pathname === path

  if (checkingAuth || !isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link href="/admin" className="text-xl font-bold">
              ClientDining Admin
            </Link>

            {/* Admin Navigation */}
            <nav className="flex items-center gap-6">
  <Link href="/admin/venues" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Venues
  </Link>
  <Link href="/admin/slots" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Slots
  </Link>
  <Link href="/admin/bookings" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Bookings
  </Link>
  <Link href="/admin/alerts" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Alerts
  </Link>
  <Link href="/admin/users" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Users
  </Link>
  <Link href="/admin/dashboard" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Activity
  </Link>
  
  {/* Add separator and account links */}
  <div className="border-l border-zinc-700 h-6 mx-2"></div>
  
  <Link href="/account" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Account
  </Link>
  <Link href="/home" className="text-sm text-zinc-100 hover:text-white transition-colors">
    Exit Admin
  </Link>
</nav>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

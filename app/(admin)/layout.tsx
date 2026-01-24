'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold">ClientDining Admin</h1>
              <nav className="flex gap-6">
                <Link href="/admin" className="hover:text-gray-300">
                  Dashboard
                </Link>
                <Link href="/admin/venues" className="hover:text-gray-300">
                  Venues
                </Link>
                <Link href="/admin/slots" className="hover:text-gray-300">
                  Slots
                </Link>
                <Link href="/admin/bookings" className="hover:text-gray-300">
                  Bookings
                </Link>
                <Link href="/admin/users" className="hover:text-gray-300">
                  Users
                </Link>
              </nav>
            </div>
            <Link href="/home" className="text-sm hover:text-gray-300">
              ← Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

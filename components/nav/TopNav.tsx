'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const navigation = [
    { name: 'Home', href: '/home' },
    { name: 'Search', href: '/search' },
    { name: 'My Bookings', href: '/bookings' },
    { name: 'My Alerts', href: '/alerts' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/home" 
            className="text-xl font-semibold text-gray-900 hover:text-gray-700"
          >
            ClientDining
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm ${
                    isActive
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <>
                <Link
                  href="/account"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

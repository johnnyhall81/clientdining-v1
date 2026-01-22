'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function TopNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/bookings', label: 'My Bookings' },
    { href: '/alerts', label: 'My Alerts' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
  ]
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/home" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">ClientDining</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-b-2 border-blue-600 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <Link
              href="/account"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Account
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  pathname === link.href
                    ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
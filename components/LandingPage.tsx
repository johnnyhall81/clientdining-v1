'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import VenueGrid from '@/components/venues/VenueGrid'

interface LandingPageProps {
  venues: any[]
}

export default function LandingPage({ venues }: LandingPageProps) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [whyVisible, setWhyVisible] = useState(false)
  const [howVisible, setHowVisible] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home')
      } else {
        setAuthChecked(true)
      }
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight
      const why = document.getElementById('why-section')
      const how = document.getElementById('how-section')
      if (why && scrollY > why.offsetTop + 100) setWhyVisible(true)
      if (how && scrollY > how.offsetTop + 100) setHowVisible(true)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* Nav */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-light text-zinc-900">ClientDining</span>
            <Link href="/login" className="text-sm font-light text-zinc-900 hover:text-zinc-700">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl lg:text-7xl font-light text-zinc-900 leading-tight tracking-tight">
            Reserve the tables<br className="hidden sm:block" /> that matter.
          </h1>
          <p className="text-sm font-light text-zinc-400">
            For City professionals.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-block px-10 py-3.5 bg-zinc-900 text-white text-xs font-light tracking-widest uppercase hover:bg-zinc-700 transition-colors duration-300"
            >
              Apply for membership
            </Link>
          </div>
        </div>
      </section>

      {/* Selected Venues — identical to /home */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-8">
          Selected venues
        </p>
        <VenueGrid venues={venues} />
      </section>

      {/* About */}
      <section
        id="why-section"
        className="border-t border-zinc-200 px-8 md:px-12 py-24"
        style={{
          opacity: whyVisible ? 1 : 0,
          transform: whyVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-12">About</p>
          <div className="max-w-xl space-y-8">
            <p className="text-sm font-light text-zinc-600 leading-relaxed">
              A small selection of London's leading restaurants and private members' clubs, chosen specifically for weekday business dining. Not a directory. Not a marketplace.
            </p>
            <p className="text-sm font-light text-zinc-600 leading-relaxed">
              Access is limited to City professionals hosting business dinners in a professional capacity. Professional status is verified via LinkedIn.
            </p>
            <p className="text-sm font-light text-zinc-600 leading-relaxed">
              Invitation only. The platform is not publicly listed or advertised. Membership is by application.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-section"
        className="border-t border-zinc-200 px-8 md:px-12 py-24"
        style={{
          opacity: howVisible ? 1 : 0,
          transform: howVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-12">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-3">01</p>
              <p className="text-sm font-light text-zinc-900 mb-2">Apply</p>
              <p className="text-sm font-light text-zinc-500 leading-relaxed">
                Request membership via LinkedIn. Your professional status is verified before access is granted.
              </p>
            </div>
            <div>
              <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-3">02</p>
              <p className="text-sm font-light text-zinc-900 mb-2">Browse and book</p>
              <p className="text-sm font-light text-zinc-500 leading-relaxed">
                View available tables at selected venues. Book directly for early evening weekday dining.
              </p>
            </div>
            <div>
              <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-3">03</p>
              <p className="text-sm font-light text-zinc-900 mb-2">Arrive</p>
              <p className="text-sm font-light text-zinc-500 leading-relaxed">
                The venue is notified. Your table is confirmed. No follow-up required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-8 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs font-light text-zinc-400 tracking-wide">
          © {new Date().getFullYear()} ClientDining Limited
        </span>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors tracking-wide">Privacy</Link>
          <Link href="/terms" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors tracking-wide">Terms</Link>
          <Link href="/overview" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors tracking-wide">For venues</Link>
        </div>
      </footer>

    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'

interface Venue {
  id: string
  name: string
  image_venue?: string
  image?: string
  cuisine_type?: string
  area?: string
}

interface LandingPageProps {
  venues: Venue[]
}

export default function LandingPage({ venues }: LandingPageProps) {
  const router = useRouter()
  const venuesRef = useRef<HTMLDivElement>(null)
  const whyRef = useRef<HTMLDivElement>(null)
  const howRef = useRef<HTMLDivElement>(null)
  const [venuesVisible, setVenuesVisible] = useState(false)
  const [whyVisible, setWhyVisible] = useState(false)
  const [howVisible, setHowVisible] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === venuesRef.current && entry.isIntersecting) setVenuesVisible(true)
          if (entry.target === whyRef.current && entry.isIntersecting) setWhyVisible(true)
          if (entry.target === howRef.current && entry.isIntersecting) setHowVisible(true)
        })
      },
      { threshold: 0.05 }
    )
    if (venuesRef.current) observer.observe(venuesRef.current)
    if (whyRef.current) observer.observe(whyRef.current)
    if (howRef.current) observer.observe(howRef.current)
    return () => observer.disconnect()
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
      <section className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center relative">
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
        <div className="absolute bottom-10 flex flex-col items-center opacity-30">
          <div className="w-px h-10 bg-zinc-400 animate-pulse" />
        </div>
      </section>

      {/* Selected Venues */}
      <section ref={venuesRef} className="px-8 md:px-12 pb-24">
        <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-10">
          Selected venues
        </p>
        {venues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {venues.map((venue, i) => {
              const imageSrc = venue.image_venue || venue.image
              return (
                <div
                  key={venue.id}
                  className="group"
                  style={{
                    transitionDelay: `${i * 60}ms`,
                    opacity: venuesVisible ? 1 : 0,
                    transform: venuesVisible ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                  }}
                >
                  <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden">
                    {imageSrc ? (
                      <>
                        <Image
                          src={imageSrc}
                          alt={venue.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-zinc-200" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-12 pb-5 px-5">
                      <p className="font-light text-sm text-white/90 tracking-wide">
                        {venue.name}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Why it exists */}
      <section ref={whyRef} className="border-t border-zinc-200 px-8 md:px-12 py-24 max-w-7xl mx-auto">
        <div
          style={{
            opacity: whyVisible ? 1 : 0,
            transform: whyVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-12">
            About
          </p>
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
      <section ref={howRef} className="border-t border-zinc-200 px-8 md:px-12 py-24 max-w-7xl mx-auto">
        <div
          style={{
            opacity: howVisible ? 1 : 0,
            transform: howVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-12">
            How it works
          </p>
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
          <Link href="/privacy" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors tracking-wide">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors tracking-wide">
            Terms
          </Link>
          <Link href="/overview" className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors tracking-wide">
            For venues
          </Link>
        </div>
      </footer>

    </div>
  )
}

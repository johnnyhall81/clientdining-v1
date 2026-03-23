'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'
import Footer from '@/components/common/Footer'

interface LandingPageProps {
  venues: any[]
}

export default function LandingPage({ venues }: LandingPageProps) {
  const router = useRouter()
  const venueGridRef = useRef<HTMLDivElement>(null)
  const [loginHovered, setLoginHovered] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pendingVenueId, setPendingVenueId] = useState<string | null>(null)

  const handleLinkedInLogin = async () => {
    setAuthLoading(true)
    // After sign-in, send them to the venue they clicked if we have one
    const destination = pendingVenueId
      ? `/venues/${pendingVenueId}`
      : '/home'
    const base =
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://clientdining.com'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: `${base}${destination}` },
    })
    if (error) setAuthLoading(false)
  }

  const handleBrowse = () => {
    venueGridRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVenueClick = (venueId: string) => {
    setPendingVenueId(venueId)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setPendingVenueId(null)
    setAuthLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/home')
    })
  }, [])

  // Close modal on Escape
  useEffect(() => {
    if (!showModal) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showModal])

  const sortedVenues = [...venues].sort(
    (a: any, b: any) => (a.display_order ?? 999) - (b.display_order ?? 999)
  )

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span
              className="text-xl font-normal"
              style={{ color: '#F3F1ED', WebkitFontSmoothing: 'antialiased' }}
            >
              ClientDining
            </span>
            <button
              onClick={() => { setPendingVenueId(null); setShowModal(true) }}
              disabled={authLoading}
              className="transition-all duration-300"
              style={{ color: loginHovered ? 'rgba(242,241,237,1)' : 'rgba(242,241,238,0.7)' }}
              aria-label="Sign in"
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  border: loginHovered
                    ? '1px solid rgba(242,241,237,0.8)'
                    : '1px solid rgba(242,241,238,0.35)',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <Image
          src="/hero.webp"
          alt="ClientDining"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 40%, rgba(0,0,0,0.17) 65%, rgba(0,0,0,0.07) 80%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 42%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        <div
          className="relative z-10 max-w-2xl mx-auto px-8 space-y-5 -mt-24"
          style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
        >
          <h1
            className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl lg:text-7xl leading-tight"
            style={{ color: '#F3F1ED', fontWeight: 500, letterSpacing: '0.4px', lineHeight: 1.15 }}
          >
            London's Best Tables
          </h1>
          <p
            className="leading-relaxed"
            style={{ color: 'rgba(243,241,237,0.78)', fontWeight: 500, fontSize: '1rem', letterSpacing: '0.3px' }}
          >
            For corporate and creative professionals
          </p>

          <div className="pt-2 flex flex-col items-center gap-5">
            <button
              onClick={handleBrowse}
              className="inline-flex items-center gap-2 px-10 py-3.5 text-sm font-light rounded-lg transition-all duration-300"
              style={{
                color: '#F3F1ED',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.35)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(255,255,255,0.2)'
                el.style.borderColor = 'rgba(255,255,255,0.55)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'rgba(255,255,255,0.08)'
                el.style.borderColor = 'rgba(255,255,255,0.35)'
              }}
            >
              Browse venues
            </button>

            <button
              onClick={() => { setPendingVenueId(null); setShowModal(true) }}
              className="text-xs font-light tracking-wide transition-all duration-300"
              style={{ color: 'rgba(243,241,237,0.55)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(243,241,237,0.9)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(243,241,237,0.55)')}
            >
              Sign in
            </button>
          </div>
        </div>

        <button
          onClick={handleBrowse}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          style={{ animation: 'heroArrowFloat 3.5s ease-in-out infinite' }}
          aria-label="Browse venues"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.7)" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </button>
        <style>{`
          @keyframes heroArrowFloat {
            0%, 100% { transform: translateX(-50%); opacity: 0.5; }
            50% { transform: translateX(-50%); opacity: 0.9; }
          }
        `}</style>
      </section>

      {/* Brand copy — original text restored */}
      <section className="bg-zinc-50 py-24 px-8">
        <div className="max-w-2xl mx-auto text-center" style={{ WebkitFontSmoothing: 'antialiased' }}>
          <p
            className="font-[family-name:var(--font-cormorant)] text-zinc-900"
            style={{ fontSize: '32px', fontWeight: 400, lineHeight: 1.48, letterSpacing: '0.005em' }}
          >
            Private booking network for business dining in London.
          </p>
          <div className="w-8 h-px bg-zinc-300 mx-auto my-10" />
          <p
            className="text-base font-light text-zinc-600 mx-auto"
            style={{ maxWidth: '560px', lineHeight: 1.85 }}
          >
            A defined circle of established restaurants and private members' clubs for client hosting, team dinners, and professional occasions that call for the right setting. Trusted venues. Clear standards. When the table matters.
          </p>
        </div>
      </section>

      {/* Venue grid */}
      <section ref={venueGridRef} className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pt-14 pb-24">
        <p
          className="font-serif text-zinc-900 mb-14 tracking-tight"
          style={{ fontSize: '30px', lineHeight: 1.1, letterSpacing: '-0.01em' }}
        >
          The collection
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {sortedVenues.map(venue => {
            const imageSrc = venue.image_hero || venue.image
            const isClub = venue.venue_type === 'club'
            return (
              <button
                key={venue.id}
                onClick={() => handleVenueClick(venue.id)}
                className="group block text-left w-full rounded-2xl border border-zinc-100 bg-white overflow-hidden transition-all duration-300 hover:border-zinc-200 hover:shadow-sm"
              >
                <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
                  {imageSrc ? (
                    <>
                      <Image
                        src={imageSrc}
                        alt={venue.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                      {venue.logo_url ? (
                        <img
                          src={venue.logo_url}
                          alt={venue.name}
                          className="absolute inset-0 m-auto object-contain z-10"
                          style={{ filter: 'brightness(0) invert(1)', maxHeight: '40%', maxWidth: '75%', width: 'auto', height: 'auto' }}
                        />
                      ) : (
                        <p
                          className="absolute inset-0 flex items-center justify-center z-10 text-white text-4xl tracking-tight text-center px-6 italic"
                          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        >
                          {venue.name}
                        </p>
                      )}
                      <div className="absolute bottom-4 left-5 right-5 z-10 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-light tracking-wide truncate">{venue.name}</p>
                          {venue.area && <p className="text-white/60 text-xs font-light mt-0.5">{venue.area}</p>}
                        </div>
                        {isClub && (
                          <span
                            className="flex-shrink-0 text-[9px] tracking-[0.18em] uppercase font-light text-white/70 px-2 py-1"
                            style={{ border: '1px solid rgba(255,255,255,0.28)', borderRadius: '2px' }}
                          >
                            Members' Club
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-zinc-100" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <Footer />

      {/* Sign-in modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) handleCloseModal() }}
        >
          <div
            className="w-full sm:max-w-sm bg-white text-center"
            style={{ borderRadius: '12px', padding: '40px 32px 36px' }}
          >
            {/* Close */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors"
              aria-label="Close"
              style={{ position: 'absolute' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p
              className="font-[family-name:var(--font-cormorant)] text-zinc-900 mb-2"
              style={{ fontSize: '26px', fontWeight: 400, lineHeight: 1.3 }}
            >
              Join to book
            </p>
            <p className="text-sm font-light text-zinc-400 leading-relaxed mb-8" style={{ maxWidth: '260px', margin: '0 auto 28px' }}>
              Sign in with LinkedIn to access the full collection and reserve a table.
            </p>

            <button
              onClick={handleLinkedInLogin}
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center gap-3 py-3 text-sm font-light rounded-lg transition-all duration-300 disabled:opacity-50"
              style={{ color: '#3f3f46', background: 'white', border: '1px solid #d4d4d8' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#a1a1aa')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#d4d4d8')}
            >
              <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {authLoading ? 'Redirecting…' : 'Continue with LinkedIn'}
            </button>

            <p className="mt-5 text-xs font-light text-zinc-400">
              New here?{' '}
              <a
                href="/signup"
                className="text-zinc-600 hover:text-zinc-900 transition-colors"
                onClick={handleCloseModal}
              >
                Apply to join
              </a>
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

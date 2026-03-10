'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'
import Footer from '@/components/common/Footer'

interface LandingPageProps {
  venues: any[]
}

export default function LandingPage({ venues }: LandingPageProps) {
  const router = useRouter()
  const [enterHovered, setEnterHovered] = useState(false)
  const [loginHovered, setLoginHovered] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  const handleLinkedInLogin = async () => {
    setAuthLoading(true)
    const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000/home'
      : 'https://clientdining.com/home'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: redirectUrl },
    })
    if (error) setAuthLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home')
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-normal" style={{ color: '#F3F1ED', WebkitFontSmoothing: 'antialiased' }}>ClientDining</span>
            <button
              onClick={handleLinkedInLogin}
              disabled={authLoading}
              className="transition-all duration-300"
              style={{ color: loginHovered ? 'rgba(242,241,237,1)' : 'rgba(242,241,238,0.7)' }}
              aria-label="Sign in"
              onMouseEnter={() => setLoginHovered(true)}
              onMouseLeave={() => setLoginHovered(false)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300" style={{ border: loginHovered ? '1px solid rgba(242,241,237,0.8)' : '1px solid rgba(242,241,238,0.35)' }}>
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
        {/* Background image */}
        <Image
          src="/hero.webp"
          alt="ClientDining"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient overlay - tight to top only, preserves image below */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 40%, rgba(0,0,0,0.17) 65%, rgba(0,0,0,0.07) 80%)'
        }} />
        {/* Radial vignette behind text only */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 42%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 70%)'
        }} />
        {/* Text — shifted slightly above centre into darker sky area */}
        <div className="relative z-10 max-w-2xl mx-auto px-8 space-y-5 -mt-24" style={{
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}>
          <h1
            className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl lg:text-7xl leading-tight"
            style={{ color: '#F3F1ED', fontWeight: 500, letterSpacing: '0.4px', lineHeight: 1.15 }}
          >
            London's Best Tables
          </h1>
          <p className="leading-relaxed" style={{ color: 'rgba(243,241,237,0.78)', fontWeight: 500, fontSize: '1rem', letterSpacing: '0.3px' }}>
            Reserved for City professionals
          </p>
          <div className="pt-2 flex flex-col items-center gap-4">
            <button
              onClick={handleLinkedInLogin}
              disabled={authLoading}
              onMouseEnter={() => setEnterHovered(true)}
              onMouseLeave={() => setEnterHovered(false)}
              className="inline-flex items-center gap-3 px-10 py-3.5 text-sm font-light rounded-lg transition-all duration-300 disabled:opacity-50"
              style={{
                color: '#F3F1ED',
                background: enterHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
                border: enterHovered ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(255,255,255,0.35)',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              {authLoading ? 'Redirecting…' : 'Continue with LinkedIn'}
            </button>
            <p className="mt-3 text-sm font-light">
  <Link
    href="/signup"
    className="transition-opacity hover:opacity-100"
    style={{ color: 'rgba(243,241,237,0.82)' }}
  >
    Apply to join
  </Link>
</p>
          </div>
        </div>

        {/* Down arrow — bottom centre */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10" style={{ animation: 'heroArrowFloat 3.5s ease-in-out infinite' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: '1px solid rgba(255,255,255,0.35)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.7)" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        <style>{`
          @keyframes heroArrowFloat {
            0%, 100% { transform: translateX(-50%); opacity: 0.5; }
            50% { transform: translateX(-50%); opacity: 0.9; }
          }
        `}</style>
      </section>

      
{/* Brand copy block */}
<section className="bg-zinc-50 py-28 px-8">
  <div
    className="max-w-2xl mx-auto text-center"
    style={{ WebkitFontSmoothing: 'antialiased' }}
  >
    {/* Headline */}
    <p
      className="font-[family-name:var(--font-cormorant)] text-zinc-900"
      style={{
        fontSize: '32px',
        fontWeight: 400,
        lineHeight: 1.48,
        letterSpacing: '0.005em'
      }}
    >
      Private booking network for professionals who host business dining in London.
    </p>

    {/* Divider */}
    <div className="w-8 h-px bg-zinc-300 mx-auto my-10" />

    {/* Body */}
    <p
      className="text-base font-light text-zinc-600 mx-auto"
      style={{
        maxWidth: '560px',
        lineHeight: 1.85
      }}
    >
      A defined circle of established restaurants and private members' clubs for client hosting, team dinners, and professional occasions that call for the right setting. Trusted venues. Clear standards. When the table matters.
    </p>

  </div>
</section>


{/* Recent additions */}
<section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pt-12">
  <p
    className="font-serif text-zinc-900 mb-14 tracking-tight"
    style={{
      fontSize: '30px',
      lineHeight: 1.1,
      letterSpacing: '-0.01em'
    }}
  >
    Featured venues
  </p>
 
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-8">
          {[...venues].sort((a: any, b: any) => (a.display_order ?? 999) - (b.display_order ?? 999)).slice(0, 3).map((venue) => {
            const imageSrc = venue.image_hero || venue.image
            return (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="group block rounded-2xl border border-zinc-100 bg-white overflow-hidden transition-all duration-300 hover:border-zinc-200 hover:shadow-sm"
              >
                <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
                  {imageSrc ? (
                    <>
                      <Image
                        src={imageSrc}
                        alt={venue.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                      {(venue as any).logo_url ? (
                        <img
                          src={(venue as any).logo_url}
                          alt={venue.name}
                          className="absolute inset-0 m-auto object-contain z-10"
                          style={{ filter: 'brightness(0) invert(1)', maxHeight: '40%', maxWidth: '75%', width: 'auto', height: 'auto' }}
                        />
                      ) : (
                        <p className="absolute inset-0 flex items-center justify-center z-10 text-white text-4xl tracking-tight text-center px-6 italic" style={{fontFamily:"Georgia, 'Times New Roman', serif"}}>{venue.name}</p>
                      )}
                      <div className="absolute bottom-4 left-5 z-10">
                        <p className="text-white text-sm font-light tracking-wide">{venue.name}</p>
                        {venue.area && <p className="text-white/60 text-xs font-light mt-0.5">{venue.area}</p>}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-zinc-100" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

                {/* CTA */}
                <div className="mt-10 pb-16 flex flex-col items-center gap-1.5">
          <p className="text-sm font-light text-zinc-500">
            New to ClientDining?
          </p>
          <Link href="/signup" className="text-sm font-medium text-zinc-500">
            Apply to join
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  )
}

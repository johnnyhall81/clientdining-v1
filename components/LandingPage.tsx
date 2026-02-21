'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'

interface LandingPageProps {
  venues: any[]
}

export default function LandingPage({ venues }: LandingPageProps) {
  const router = useRouter()
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
      <section className="flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 pt-24 pb-20 text-center">
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

      {/* Latest Additions — 3 venues, editorial style */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-24">
        <p className="text-xs font-light tracking-widest uppercase text-zinc-400 mb-8">
          Latest additions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-10">
          {venues.slice(0, 3).map((venue) => {
            const imageSrc = venue.image_venue || venue.image
            return (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="group block"
              >
                {/* Tall portrait image */}
                <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden mb-4">
                  {imageSrc ? (
                    <>
                      <Image
                        src={imageSrc}
                        alt={venue.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-zinc-200" />
                  )}
                </div>
                {/* Text below image */}
                <p className="text-lg font-light text-zinc-900 tracking-wide mt-5">
                  {venue.name}
                </p>
                {venue.area && (
                  <p className="text-sm font-light text-zinc-400 mt-1 tracking-wide">
                    {venue.area}
                  </p>
                )}
              </Link>
            )
          })}
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

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Venue } from '@/lib/supabase'

interface VenueTileProps {
  venue: Venue & { image?: string }
  availableSlots?: number
}

export default function VenueTile({ venue, availableSlots = 0 }: VenueTileProps) {
  const imageSrc = venue.image_venue || venue.image

  return (
    <Link
      href={`/venues/${venue.id}`}
      prefetch={true}
      className="group block cursor-pointer focus:outline-none focus-visible:shadow-sm"
    >
      {/* Tall portrait image — no rounded corners, no text overlay */}
      <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden mb-4">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
        )}

        {/* Available badge */}
        {availableSlots > 0 && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-light text-green-700 bg-green-50 px-3 py-1">
              Available
            </span>
          </div>
        )}
      </div>

      {/* Text below image */}
      <h3 className="text-base font-light text-zinc-900 tracking-wide leading-snug">
        {venue.name}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        {venue.area && (
          <p className="text-sm font-light text-zinc-400">{venue.area}</p>
        )}
        {venue.area && venue.venue_type && (
          <span className="text-zinc-300 text-xs">·</span>
        )}
        {venue.venue_type && (
          <p className="text-sm font-light text-zinc-400 capitalize">
            {venue.venue_type === 'club' ? 'Members club' : 'Restaurant'}
          </p>
        )}
      </div>
    </Link>
  )
}

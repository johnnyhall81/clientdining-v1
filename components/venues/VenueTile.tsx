'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Venue } from '@/lib/supabase'

interface VenueTileProps {
  venue: Venue & { image?: string }
  availableSlots?: number
}

export default function VenueTile({ venue, availableSlots = 0 }: VenueTileProps) {
  const imageSrc = venue.image_hero || venue.image

  return (
    <Link
      href={`/venues/${venue.id}`}
      prefetch={true}
      className="group block cursor-pointer focus:outline-none rounded-2xl border border-zinc-100 bg-white overflow-hidden transition-all duration-300 hover:border-zinc-200 hover:shadow-sm"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-zinc-100 overflow-hidden">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            {(venue as any).logo_url ? (
              <img
                src={(venue as any).logo_url}
                alt={venue.name}
                className="absolute inset-0 m-auto h-auto w-3/4 object-contain z-10"
              />
            ) : (
              <p
                className="absolute inset-0 flex items-center justify-center z-10 text-white text-4xl tracking-tight text-center px-6 italic"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {venue.name}
              </p>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>
        )}

        {/* Available badge */}
        {availableSlots > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-xs font-light text-green-700 bg-green-50 px-3 py-1 rounded-full">
              Available
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="px-5 py-4 text-center">
        <h3 className="text-base font-light text-zinc-900 tracking-wide leading-snug">
          {venue.name}
        </h3>
        {venue.area && (
          <p className="text-sm font-light text-zinc-400 mt-1">{venue.area}</p>
        )}
      </div>
    </Link>
  )
}

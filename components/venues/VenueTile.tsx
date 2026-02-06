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
      className="group block cursor-pointer rounded-md focus:outline-none focus-visible:shadow-sm"
    >
      <div className="relative aspect-[16/10] bg-zinc-100 rounded-md overflow-hidden">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-opacity duration-300"
            />
            {/* Hover darken overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-600">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Dark gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-5 px-5">
          <h3 className="font-light text-base text-white/90 tracking-wide leading-snug line-clamp-2">
            {venue.name}
          </h3>
        </div>

        {/* Available badge - top right */}
        {availableSlots > 0 && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full shadow-sm">
              Available today
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
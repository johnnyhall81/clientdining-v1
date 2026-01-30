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

      <div>
        <div className="relative aspect-[4/3] bg-gray-200 rounded-md overflow-hidden mb-3">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={venue.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 will-change-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 transition-transform duration-300 will-change-transform group-hover:scale-105">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
        <h3 className="font-semibold text-lg text-gray-900">
          {venue.name}
        </h3>

        <p className="text-sm text-gray-600 capitalize">
          {venue.area} · {venue.venue_type}
        </p>

          {availableSlots > 0 && (
            <p className="text-sm text-green-600 font-medium">
              {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
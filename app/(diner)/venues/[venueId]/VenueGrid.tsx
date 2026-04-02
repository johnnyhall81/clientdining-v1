'use client'

import { Venue } from '@/lib/supabase'
import VenueTile from './VenueTile'

interface VenueGridProps {
  venues: Venue[]
}

export default function VenueGrid({ venues }: VenueGridProps) {
  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 font-light leading-relaxed">No venues available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">

      {/* Intro panel — full width across all columns */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <div
          className="rounded-2xl border border-zinc-100 bg-zinc-50 px-10 py-12 md:px-16 md:py-14"
        >
          <div className="max-w-xl">
            <h1
              className="text-zinc-900 font-light mb-4 leading-snug"
              style={{ fontSize: '1.375rem', letterSpacing: '-0.01em' }}
            >
              A defined circle for business dining in London
            </h1>
            <p className="text-sm font-light text-zinc-400 leading-relaxed">
              Trusted tables and spaces for hosting, team occasions, and private events.
            </p>
          </div>
        </div>
      </div>

      {/* Venue tiles */}
      {venues.map((venue, index) => (
        <VenueTile key={venue.id} venue={venue} priority={index < 6} />
      ))}

    </div>
  )
}

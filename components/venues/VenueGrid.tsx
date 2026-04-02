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

      {/* Intro panel */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 -mb-4">
        <div
          className="rounded-2xl px-9 py-8"
          style={{ backgroundColor: '#F5F3F0', border: '1px solid #EBE8E4' }}
        >
          <p
            className="text-zinc-800 font-light mb-2 leading-snug"
            style={{ fontSize: '1.125rem', letterSpacing: '-0.01em', maxWidth: '480px' }}
          >
            A defined circle for business dining in London
          </p>
          <p
            className="font-light leading-relaxed"
            style={{ fontSize: '0.8125rem', color: '#6B6763', maxWidth: '420px' }}
          >
            Trusted tables and spaces for hosting, team occasions, and private events.
          </p>
        </div>
      </div>

      {/* Venue tiles */}
      {venues.map((venue, index) => (
        <VenueTile key={venue.id} venue={venue} priority={index < 6} />
      ))}

    </div>
  )
}

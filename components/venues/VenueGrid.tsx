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
    <div>
      {/* Hero band — full width, sits flush against the nav */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-10 bg-white border-b border-zinc-100 px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-light mb-3">
          London
        </p>
        <h1
          className="text-zinc-900 mb-2"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          London&apos;s Best Tables &amp; Spaces
        </h1>
        <p className="text-sm font-light text-zinc-400">
          For hosting, team occasions and private events
        </p>
      </div>

      {/* Venue grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {venues.map((venue, index) => (
          <VenueTile key={venue.id} venue={venue} priority={index < 6} />
        ))}
      </div>
    </div>
  )
}

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

      {/* Hero — first row, full width, same visual weight as tile row */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col justify-end bg-white rounded-2xl border border-zinc-100 px-10 py-10"
        style={{ minHeight: 'clamp(220px, 28vw, 360px)' }}
      >
        <p className="text-[9px] tracking-[0.3em] text-zinc-300 uppercase font-light mb-4">
          London
        </p>
        <h1
          className="text-zinc-900 mb-3"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          London&apos;s Best Tables &amp; Spaces
        </h1>
        <p className="text-sm font-light text-zinc-400 max-w-md">
          For hosting, team occasions and private events
        </p>
      </div>

      {/* Venue tiles */}
      {venues.map((venue, index) => (
        <VenueTile key={venue.id} venue={venue} priority={index < 6} />
      ))}

    </div>
  )
}

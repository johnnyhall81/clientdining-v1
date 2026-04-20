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

      {/* Hero */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 md:py-14">
        <h1
          className="text-zinc-900 mb-3"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          London&apos;s Best Tables &amp; Spaces
        </h1>
        <p className="font-light" style={{ fontSize: '0.9375rem', color: '#8A8580', letterSpacing: '0.01em' }}>
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

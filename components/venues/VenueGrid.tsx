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
        <p className="text-zinc-600 font-light leading-relaxed">No venues available at the moment.</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {venues.map((venue) => (
        <VenueTile key={venue.id} venue={venue} />
      ))}
    </div>
  )
}

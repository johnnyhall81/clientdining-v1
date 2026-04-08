'use client'

import { useState, useMemo } from 'react'
import { Venue } from '@/lib/supabase'
import VenueTile from './VenueTile'
import VenueFilterBar, { FilterState } from './VenueFilterBar'

interface VenueGridProps {
  venues: Venue[]
}

// ─── Size filter helper ────────────────────────────────────────────────────────
// TODO: wire to a venue-level `max_capacity` column once added to DB.
// For now all venues pass the size filter.
function venueMatchesSize(venue: Venue, sizes: string[]): boolean {
  if (sizes.length === 0) return true
  // const cap = venue.max_capacity
  // if (!cap) return true
  // return sizes.some(s => {
  //   if (s === 'Up to 10')  return cap >= 10
  //   if (s === 'Up to 20')  return cap >= 20
  //   if (s === 'Up to 40')  return cap >= 40
  //   if (s === 'Up to 80')  return cap >= 80
  //   if (s === '80+')       return cap > 80
  //   return true
  // })
  return true // remove once max_capacity is available
}

// ─── Occasion filter helper ────────────────────────────────────────────────────
// TODO: wire to private_hire_rooms.best_for[] once included in the home query.
// For now all venues pass the occasion filter.
function venueMatchesOccasion(venue: Venue, occasions: string[]): boolean {
  if (occasions.length === 0) return true
  // return occasions.some(o => venue.private_hire_rooms?.some(r => r.best_for?.includes(o)))
  return true // remove once rooms data is joined
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueGrid({ venues }: VenueGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    areas: [],
    occasions: [],
  })

  // Derive unique areas from venue data, sorted alphabetically
  const areas = useMemo(() => {
    return Array.from(new Set(venues.map(v => v.area).filter(Boolean))).sort()
  }, [venues])

  // Apply filters
  const filtered = useMemo(() => {
    return venues.filter(venue => {
      if (filters.areas.length > 0 && !filters.areas.includes(venue.area)) return false
      if (!venueMatchesSize(venue, filters.sizes)) return false
      if (!venueMatchesOccasion(venue, filters.occasions)) return false
      return true
    })
  }, [venues, filters])

  const hasFilters = filters.sizes.length + filters.areas.length + filters.occasions.length > 0

  if (venues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 font-light leading-relaxed">No venues available at the moment.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Intro */}
      <div className="text-center py-10 md:py-12">
        <h1
          className="text-zinc-900 mb-3"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          London's Best Tables & Spaces
        </h1>
        <p
          className="font-light"
          style={{ fontSize: '0.9375rem', color: '#8A8580', letterSpacing: '0.01em' }}
        >
          For hosting, team occasions and private events
        </p>
      </div>

      {/* Filter bar */}
      <VenueFilterBar areas={areas} filters={filters} onChange={setFilters} />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 font-light" style={{ fontSize: '0.9375rem' }}>
            No venues match your filters.
          </p>
          <button
            onClick={() => setFilters({ sizes: [], areas: [], occasions: [] })}
            className="mt-3 text-zinc-500 hover:text-zinc-800 transition-colors"
            style={{ fontSize: '0.875rem' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {hasFilters && (
            <p className="text-zinc-400 font-light mb-6" style={{ fontSize: '0.8125rem' }}>
              {filtered.length} venue{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map((venue, index) => (
              <VenueTile key={venue.id} venue={venue} priority={index < 6} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

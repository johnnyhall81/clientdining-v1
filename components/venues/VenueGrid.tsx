'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Venue } from '@/lib/supabase'
import VenueTile from './VenueTile'
import VenueFilterModal, { VenueFilters } from './VenueFilterModal'
import {
  applyVenueFilters,
  countActiveVenueFilters,
  DEFAULT_VENUE_FILTERS,
  parseVenueFilters,
  serialiseVenueFilters,
} from '@/lib/venueBrowseFilters'

interface VenueGridProps {
  venues: Venue[]
  showHero?: boolean
}

export default function VenueGrid({ venues, showHero = false }: VenueGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters = useMemo(() => parseVenueFilters(searchParams), [searchParams])

  const availableAreas = useMemo(
    () => Array.from(new Set(venues.map((v) => v.area).filter(Boolean))),
    [venues]
  )

  const filtered = useMemo(() => applyVenueFilters(venues, filters), [venues, filters])

  const activeCount = countActiveVenueFilters(filters)
  const hasVenues = venues.length > 0

  const updateFilters = (next: VenueFilters) => {
    const params = serialiseVenueFilters(next, searchParams)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div>
      {hasVenues && (
        <div className="flex items-baseline justify-between mb-6 md:mb-8">
          <p className="text-xs font-light text-zinc-400">
            {filtered.length === venues.length
              ? `${venues.length} venues`
              : `${filtered.length} of ${venues.length} venues`}
          </p>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-xs font-light text-zinc-600 hover:text-zinc-900 transition-colors py-1.5 px-3"
            style={{ border: '1px solid var(--divider)', borderRadius: '20px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>Filter &amp; Sort</span>
            {activeCount > 0 && (
              <span
                className="inline-flex items-center justify-center bg-zinc-900 text-white rounded-full"
                style={{ minWidth: '18px', height: '18px', fontSize: '10px', padding: '0 5px' }}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 font-light leading-relaxed mb-4">
            {hasVenues ? 'No venues match your filters.' : 'No venues available at the moment.'}
          </p>
          {hasVenues && activeCount > 0 && (
            <button
              onClick={() => updateFilters(DEFAULT_VENUE_FILTERS)}
              className="text-xs font-light text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {showHero && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 md:py-14">
              <h1
                className="text-zinc-900 mb-5"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.0,
                }}
              >
                London&rsquo;s Best Tables &amp; Spaces
              </h1>
              <p
                className="font-light mx-auto"
                style={{
                  fontSize: '0.9375rem',
                  color: '#8A8580',
                  letterSpacing: '0.005em',
                  lineHeight: 1.45,
                  maxWidth: '32rem',
                }}
              >
                For hosting, team occasions, and private events
              </p>
            </div>
          )}

          {filtered.map((venue, index) => (
            <VenueTile key={venue.id} venue={venue} priority={index < 6} />
          ))}
        </div>
      )}

      <VenueFilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={updateFilters}
        availableAreas={availableAreas}
      />
    </div>
  )
}

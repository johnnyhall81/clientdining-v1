'use client'

import { useMemo, useState } from 'react'
import { Venue } from '@/lib/supabase'
import VenueTile from './VenueTile'
import VenueFilterModal, { VenueFilters } from './VenueFilterModal'

interface VenueGridProps {
  venues: Venue[]
  showHero?: boolean
}

const DEFAULT_FILTERS: VenueFilters = {
  mode: 'all',
  areas: [],
  sort: 'featured',
}

export default function VenueGrid({ venues, showHero = false }: VenueGridProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<VenueFilters>(DEFAULT_FILTERS)

  const availableAreas = useMemo(() =>
    Array.from(new Set(venues.map(v => v.area).filter(Boolean))),
    [venues]
  )

  const filtered = useMemo(() => {
    let result = [...venues]

    if (filters.mode === 'tables') {
      result = result.filter(v => !(v as any).hire_only)
    }
    if (filters.mode === 'spaces') {
      result = result.filter(v => v.private_hire_available || (v as any).hire_only)
    }
    if (filters.areas.length > 0) {
      result = result.filter(v => filters.areas.includes(v.area))
    }

    if (filters.sort === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    // 'featured' preserves the server's display_order ordering

    return result
  }, [venues, filters])

  const activeCount =
    (filters.mode !== 'all' ? 1 : 0) +
    filters.areas.length +
    (filters.sort !== 'featured' ? 1 : 0)

  const hasVenues = venues.length > 0

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
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs font-light text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">

          {showHero && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 md:py-24 lg:py-28">
              <h1
                className="text-zinc-900 mb-5"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.0,
                }}
              >
                London&rsquo;s Best<br />Tables &amp; Spaces
              </h1>
              <p
                className="font-light mx-auto"
                style={{
                  fontSize: 'clamp(1rem, 1.4vw, 1.25rem)',
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
        onChange={setFilters}
        availableAreas={availableAreas}
      />

    </div>
  )
}

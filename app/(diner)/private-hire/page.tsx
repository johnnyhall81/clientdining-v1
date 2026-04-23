'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import CorporateEventsModal from '@/components/modals/CorporateEventsModal'
import PrivateHireFilterModal from '@/components/modals/PrivateHireFilterModal'
import {
  DEFAULT_PRIVATE_HIRE_FILTERS,
  GUEST_RANGES,
  PrivateHireFilters,
  parsePrivateHireFilters,
  privateHireActiveCount,
  serializePrivateHireFilters,
} from '@/lib/privateHireBrowseFilters'

type Room = {
  id: string
  venue_id: string
  name: string
  description: string
  space_type: string
  capacity_dining: number | null
  capacity_standing: number | null
  capacity_boardroom: number | null
  pricing_type: string
  pricing_from: number | null
  pricing_notes: string
  facilities: string[]
  best_for: string[]
  catering: string[]
  images: { url: string; caption: string; is_main: boolean }[]
  display_order: number
  venue: {
    id: string
    name: string
    area: string
    image_hero: string | null
    logo_url: string | null
  }
}

export default function Page() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [enquiringRoom, setEnquiringRoom] = useState<Room | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () => parsePrivateHireFilters(searchParams),
    [searchParams]
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('private_hire_rooms')
        .select(`*, venue:venues!inner(id, name, area, image_hero, logo_url)`)
        .eq('is_active', true)
        .eq('venues.is_active', true)
        .order('display_order', { ascending: true })

      if (!error) setRooms((data || []) as any)
      setLoading(false)
    }

    load()
  }, [])

  const setFilters = (next: PrivateHireFilters) => {
    const query = serializePrivateHireFilters(next)
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const filtered = useMemo(() => {
    return rooms.filter(room => {
      if (filters.areas.length > 0 && !filters.areas.includes(room.venue.area)) return false
      if (filters.occasions.length > 0 && !filters.occasions.some(o => room.best_for?.includes(o))) return false

      if (filters.guest) {
        const range = GUEST_RANGES.find(r => r.label === filters.guest)
        if (range) {
          const maxCap = Math.max(
            room.capacity_dining || 0,
            room.capacity_standing || 0,
            room.capacity_boardroom || 0,
          )

          if (range.max === Infinity) {
            if (maxCap > 0 && maxCap < 80) return false
          } else {
            if (maxCap > 0 && maxCap < range.max) return false
          }
        }
      }

      return true
    })
  }, [rooms, filters])

  const PRIORITY_AREAS = ['Canary Wharf', 'The City', 'Mayfair', 'Belgravia', 'Soho', 'Marylebone']
  const PRIORITY_OCCASIONS = ['Summer party', 'Christmas party', 'Board meeting', 'Networking']

  const allAreas = useMemo(
    () => Array.from(new Set(rooms.map(r => r.venue.area).filter(Boolean))).sort(),
    [rooms]
  )
  const availableAreas = useMemo(
    () => [
      ...PRIORITY_AREAS.filter(a => allAreas.includes(a)),
      ...allAreas.filter(a => !PRIORITY_AREAS.includes(a)),
    ],
    [allAreas]
  )

  const allOccasions = useMemo(
    () => Array.from(new Set(rooms.flatMap(r => r.best_for || []).filter(Boolean))).sort(),
    [rooms]
  )
  const availableOccasions = useMemo(
    () => [
      ...PRIORITY_OCCASIONS.filter(o => allOccasions.includes(o)),
      ...allOccasions.filter(o => !PRIORITY_OCCASIONS.includes(o)),
    ],
    [allOccasions]
  )

  const activeCount = privateHireActiveCount(filters)
  const hasFilters = activeCount > 0

  const summaryRows: { label: string; values: string[] }[] = [
    { label: 'Group size', values: filters.guest ? [filters.guest] : [] },
    { label: 'Location', values: filters.areas },
    { label: 'Occasion', values: filters.occasions },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        {!loading && (
          <p className="font-light text-zinc-500" style={{ fontSize: '0.9375rem', letterSpacing: '0.01em' }}>
            {filtered.length === 0
              ? 'No spaces found'
              : `${filtered.length} private ${filtered.length === 1 ? 'space' : 'spaces'} across London`}
          </p>
        )}

        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 text-xs font-light text-zinc-600 hover:text-zinc-900 transition-colors py-1.5 px-3 ml-auto"
          style={{ border: '1px solid var(--divider)', borderRadius: '20px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          <span>Filter</span>
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

      {hasFilters && (
        <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid #F0EDE9' }}>
          {summaryRows.map(row =>
            row.values.length > 0 ? (
              <div key={row.label} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-1.5" style={{ minWidth: '4.5rem' }}>
                  <span className="text-[10px] font-light text-zinc-400">{row.label}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {row.values.map(value => (
                    <button
                      key={value}
                      onClick={() => setFiltersOpen(true)}
                      className="transition-colors"
                      style={{
                        borderRadius: '20px',
                        border: '1px solid #18181B',
                        backgroundColor: '#18181B',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 300,
                        lineHeight: 1,
                        padding: '4px 12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p className="text-sm font-light text-zinc-400">Loading spaces…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-100">
          <p className="text-sm font-light text-zinc-400">No spaces match your filters.</p>
          <button
            onClick={() => setFilters(DEFAULT_PRIVATE_HIRE_FILTERS)}
            className="mt-3 text-xs font-light text-zinc-500 hover:text-zinc-800 transition-colors underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((room, roomIndex) => {
            const mainImage = room.images?.find(i => i.is_main) || room.images?.[0]
            const heroImage = mainImage?.url || room.venue.image_hero

            return (
              <div
                key={room.id}
                className="bg-white overflow-hidden"
                style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <Link
                  href={`/venues/${room.venue_id}?tab=private_hire`}
                  className="block relative overflow-hidden"
                  style={{ paddingTop: '75%' }}
                >
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={room.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={roomIndex < 4}
                      className="object-cover transition-[transform,opacity] duration-500 hover:scale-[1.02]"
                      style={{ opacity: 0 }}
                      onLoad={e => { (e.target as HTMLImageElement).style.opacity = '1' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-100" />
                  )}
                </Link>

                <div className="px-6 py-6">
                  <p className="text-[9px] tracking-[0.15em] text-zinc-400 uppercase font-light mb-2.5">
                    {room.venue.name} · {room.venue.area}
                  </p>

                  <div
                    className={`grid gap-4 sm:gap-5 mb-5 pb-5 items-start ${room.venue.logo_url ? 'grid-cols-[minmax(0,1fr)_100px] sm:grid-cols-[minmax(0,1fr)_140px]' : 'grid-cols-1'}`}
                    style={{ borderBottom: '1px solid var(--divider-soft)' }}
                  >
                    <div className="min-w-0">
                      <h3 className="text-lg font-light text-zinc-900 tracking-tight mb-3">
                        {room.name}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {room.capacity_dining && (
                          <div>
                            <p className="text-[8px] tracking-[0.15em] text-zinc-400 uppercase font-light mb-0.5">Dining</p>
                            <p className="text-xs font-light text-zinc-600">{room.capacity_dining} seated</p>
                          </div>
                        )}
                        {room.capacity_standing && (
                          <div>
                            <p className="text-[8px] tracking-[0.15em] text-zinc-400 uppercase font-light mb-0.5">Standing</p>
                            <p className="text-xs font-light text-zinc-600">{room.capacity_standing} guests</p>
                          </div>
                        )}
                        {room.capacity_boardroom && (
                          <div>
                            <p className="text-[8px] tracking-[0.15em] text-zinc-400 uppercase font-light mb-0.5">Boardroom</p>
                            <p className="text-xs font-light text-zinc-600">{room.capacity_boardroom} guests</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {room.venue.logo_url && (
                      <div className="hidden sm:flex h-full items-start justify-end">
                        <img
                          src={room.venue.logo_url}
                          alt={room.venue.name}
                          className="object-contain"
                          style={{ maxHeight: '56px', maxWidth: '120px', width: '100%', filter: 'brightness(0)', opacity: 0.72 }}
                        />
                      </div>
                    )}
                  </div>

                  {room.description && (
                    <p className="text-sm font-light text-zinc-500 leading-relaxed mb-5 line-clamp-3">
                      {room.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(room.best_for || []).slice(0, 4).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-light text-zinc-500 px-2.5 py-1"
                        style={{ border: '1px solid var(--divider)', borderRadius: '999px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[8px] tracking-[0.15em] text-zinc-400 uppercase font-light mb-0.5">Pricing</p>
                      <p className="text-sm font-light text-zinc-700">
                        {room.pricing_from
                          ? `From £${room.pricing_from.toLocaleString()}`
                          : room.pricing_notes || 'On enquiry'}
                      </p>
                    </div>

                    <button
                      onClick={() => setEnquiringRoom(room)}
                      className="px-4 py-2 text-[10px] tracking-[0.16em] uppercase font-light text-white bg-zinc-900 hover:bg-zinc-700 transition-colors"
                      style={{ borderRadius: '4px' }}
                    >
                      Enquire
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PrivateHireFilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        availableAreas={availableAreas}
        availableOccasions={availableOccasions}
      />

      {enquiringRoom && (
        <CorporateEventsModal
          isOpen={true}
          onClose={() => setEnquiringRoom(null)}
          venueId={enquiringRoom.venue_id}
          venueName={enquiringRoom.venue.name}
          roomName={enquiringRoom.name}
        />
      )}
    </div>
  )
}

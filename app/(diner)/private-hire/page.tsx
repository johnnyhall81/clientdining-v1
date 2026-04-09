'use client'
// v2
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase-client'
import CorporateEventsModal from '@/components/modals/CorporateEventsModal'

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

const GUEST_RANGES = [
  { label: 'Up to 10', max: 10 },
  { label: 'Up to 20', max: 20 },
  { label: 'Up to 40', max: 40 },
  { label: 'Up to 80', max: 80 },
  { label: '80+', max: Infinity },
]

const pillStyle = (active: boolean) => ({
  borderRadius: '20px',
  border: '1px solid',
  borderColor: active ? '#18181B' : '#E4E4E7',
  backgroundColor: active ? '#18181B' : 'transparent',
  color: active ? 'white' : '#71717A',
})

const DEFAULT_VISIBLE = 4 // chips shown before "+ more"

export default function Page() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAreas, setFilterAreas] = useState<string[]>([])
  const [filterGuest, setFilterGuest] = useState('')
  const [filterOccasion, setFilterOccasion] = useState('')
  const [enquiringRoom, setEnquiringRoom] = useState<Room | null>(null)
  const [openGroup, setOpenGroup] = useState<'size' | 'area' | 'occasion' | null>(null)

  const toggleGroup = (group: 'size' | 'area' | 'occasion') =>
    setOpenGroup(prev => prev === group ? null : group)

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

  const filtered = rooms.filter(room => {
    if (filterAreas.length > 0 && !filterAreas.includes(room.venue.area)) return false
    if (filterOccasion && !room.best_for?.includes(filterOccasion)) return false

    if (filterGuest) {
      const range = GUEST_RANGES.find(r => r.label === filterGuest)
      if (range) {
        const maxCap = Math.max(
          room.capacity_dining || 0,
          room.capacity_standing || 0,
          room.capacity_boardroom || 0
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

  const toggleArea = (area: string) =>
    setFilterAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )

  const PRIORITY_AREAS = ['Canary Wharf', 'The City', 'Mayfair']
  const PRIORITY_OCCASIONS = ['Summer party', 'Christmas party', 'Board meeting', 'Networking']

  const allAreas = Array.from(new Set(rooms.map(r => r.venue.area))).sort()
  const availableAreas = [
    ...PRIORITY_AREAS.filter(a => allAreas.includes(a)),
    ...allAreas.filter(a => !PRIORITY_AREAS.includes(a)),
  ]

  const allOccasions = Array.from(new Set(rooms.flatMap(r => r.best_for || []))).sort()
  const availableOccasions = [
    ...PRIORITY_OCCASIONS.filter(o => allOccasions.includes(o)),
    ...allOccasions.filter(o => !PRIORITY_OCCASIONS.includes(o)),
  ]

  const hasFilters = filterAreas.length > 0 || filterGuest || filterOccasion
  const clearFilters = () => {
    setFilterAreas([])
    setFilterGuest('')
    setFilterOccasion('')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[9px] tracking-[0.25em] text-zinc-400 uppercase font-light">
          Private hire · London
        </p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid #F0EDE9' }}>

        {/* Size */}
        {(() => {
          // Size is always short enough to show all — no expand needed
          return (
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1.5" style={{ minWidth: '4.5rem' }}>
                <span className="text-[9px] tracking-[0.1em] text-zinc-400 uppercase font-light">Group size</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GUEST_RANGES.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setFilterGuest(filterGuest === r.label ? '' : r.label)}
                    className="px-3 py-1 text-xs font-light transition-colors"
                    style={pillStyle(filterGuest === r.label)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Area */}
        {(() => {
          const selected = filterAreas
          const unselected = availableAreas.filter(a => !selected.includes(a))
          const isOpen = openGroup === 'area'
          const visibleUnselected = isOpen ? unselected : unselected.slice(0, Math.max(0, DEFAULT_VISIBLE - selected.length))
          const hiddenCount = isOpen ? 0 : unselected.length - visibleUnselected.length
          return (
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleGroup('area')}
                className="flex items-center gap-1.5 flex-shrink-0 mt-1.5"
                style={{ minWidth: '4.5rem' }}
              >
                <span className="text-[9px] tracking-[0.1em] text-zinc-400 uppercase font-light">Location</span>
                {selected.length > 0 && (
                  <span className="bg-zinc-900 text-white rounded-full flex items-center justify-center text-[9px]"
                    style={{ minWidth: '1rem', height: '1rem', padding: '0 3px' }}>
                    {selected.length}
                  </span>
                )}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {selected.map(a => (
                  <button key={a} onClick={() => toggleArea(a)} className="px-3 py-1 text-xs font-light transition-colors" style={pillStyle(true)}>
                    {a}
                  </button>
                ))}
                {visibleUnselected.map(a => (
                  <button key={a} onClick={() => toggleArea(a)} className="px-3 py-1 text-xs font-light transition-colors" style={pillStyle(false)}>
                    {a}
                  </button>
                ))}
                {hiddenCount > 0 && (
                  <button onClick={() => toggleGroup('area')} className="px-3 py-1 text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    + {hiddenCount} more
                  </button>
                )}
                {isOpen && (
                  <button onClick={() => toggleGroup('area')} className="px-3 py-1 text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    Less
                  </button>
                )}
                {selected.length > 0 && (
                  <button onClick={() => setFilterAreas([])} className="px-2 py-1 text-xs font-light text-zinc-300 hover:text-zinc-500 transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>
          )
        })()}

        {/* Occasion */}
        {(() => {
          const isOpen = openGroup === 'occasion'
          const isSelected = (o: string) => filterOccasion === o
          const selected = filterOccasion ? [filterOccasion] : []
          const unselected = availableOccasions.filter(o => o !== filterOccasion)
          const visibleUnselected = isOpen ? unselected : unselected.slice(0, Math.max(0, DEFAULT_VISIBLE - selected.length))
          const hiddenCount = isOpen ? 0 : unselected.length - visibleUnselected.length
          return (
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleGroup('occasion')}
                className="flex items-center gap-1.5 flex-shrink-0 mt-1.5"
                style={{ minWidth: '4.5rem' }}
              >
                <span className="text-[9px] tracking-[0.1em] text-zinc-400 uppercase font-light">Occasion</span>
                {filterOccasion && (
                  <span className="bg-zinc-900 text-white rounded-full flex items-center justify-center text-[9px]"
                    style={{ minWidth: '1rem', height: '1rem', padding: '0 3px' }}>
                    1
                  </span>
                )}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {selected.map(o => (
                  <button key={o} onClick={() => setFilterOccasion('')} className="px-3 py-1 text-xs font-light transition-colors" style={pillStyle(true)}>
                    {o}
                  </button>
                ))}
                {visibleUnselected.map(o => (
                  <button key={o} onClick={() => setFilterOccasion(o)} className="px-3 py-1 text-xs font-light transition-colors" style={pillStyle(false)}>
                    {o}
                  </button>
                ))}
                {hiddenCount > 0 && (
                  <button onClick={() => toggleGroup('occasion')} className="px-3 py-1 text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    + {hiddenCount} more
                  </button>
                )}
                {isOpen && (
                  <button onClick={() => toggleGroup('occasion')} className="px-3 py-1 text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors">
                    Less
                  </button>
                )}
              </div>
            </div>
          )
        })()}

      </div>

      {!loading && (
        <p className="text-sm font-light text-zinc-500">
          {filtered.length === 0
            ? 'No spaces found'
            : `${filtered.length} ${filtered.length === 1 ? 'private space' : 'private spaces'}`}
        </p>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p className="text-sm font-light text-zinc-400">Loading spaces…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-100">
          <p className="text-sm font-light text-zinc-400">No spaces match your filters.</p>
          <button
            onClick={clearFilters}
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

                <div className="px-5 py-5">
                  <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-light mb-2">
                    {room.venue.name} · {room.venue.area}
                  </p>

                  <div
                    className={`grid gap-4 sm:gap-5 mb-4 pb-4 items-start ${room.venue.logo_url ? 'grid-cols-[minmax(0,1fr)_120px] sm:grid-cols-[minmax(0,1fr)_160px] lg:grid-cols-[minmax(0,1fr)_220px]' : 'grid-cols-1'}`}
                    style={{ borderBottom: '1px solid #F0EDE9' }}
                  >
                    <div className="min-w-0">
                      <h3 className="text-lg font-light text-zinc-900 tracking-tight mb-3">
                        {room.name}
                      </h3>

                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {room.capacity_dining && (
                          <div>
                            <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">
                              Dining
                            </p>
                            <p className="text-xs font-light text-zinc-700">
                              {room.capacity_dining} seated
                            </p>
                          </div>
                        )}
                        {room.capacity_standing && (
                          <div>
                            <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">
                              Standing
                            </p>
                            <p className="text-xs font-light text-zinc-700">
                              {room.capacity_standing} guests
                            </p>
                          </div>
                        )}
                        {room.capacity_boardroom && (
                          <div>
                            <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">
                              Boardroom
                            </p>
                            <p className="text-xs font-light text-zinc-700">
                              {room.capacity_boardroom} seats
                            </p>
                          </div>
                        )}
                        {room.pricing_from && (
                          <div>
                            <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">
                              {room.pricing_type === 'min_spend'
                                ? 'Min spend'
                                : room.pricing_type === 'hire_fee'
                                  ? 'Hire fee'
                                  : 'From'}
                            </p>
                            <p className="text-xs font-light text-zinc-700">
                              £{room.pricing_from.toLocaleString()}
                              {room.pricing_notes ? ` ${room.pricing_notes}` : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {room.venue.logo_url && (
                      <div className="flex min-h-[88px] items-center justify-start sm:justify-end overflow-hidden">
                        <img
                          src={room.venue.logo_url}
                          alt={room.venue.name}
                          loading="lazy"
                          className="block w-full max-w-none h-[56px] sm:h-[72px] lg:h-[80px] object-contain object-left sm:object-right transition-opacity duration-500"
                          style={{ filter: 'brightness(0)', opacity: 0 }}
                          onLoad={e => { (e.target as HTMLImageElement).style.opacity = '0.72' }}
                        />
                      </div>
                    )}
                  </div>

                  {room.description && (
                    <p className="text-sm font-light text-zinc-500 leading-relaxed mb-4">
                      {room.description}
                    </p>
                  )}

                  {room.best_for?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {room.best_for.map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] font-light text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setEnquiringRoom(room)}
                      className="h-9 px-5 text-xs font-light tracking-widest uppercase text-white bg-zinc-900 hover:bg-zinc-700 transition-colors"
                      style={{ borderRadius: '3px' }}
                    >
                      Enquire
                    </button>
                    <Link
                      href={`/venues/${room.venue_id}?tab=private_hire`}
                      className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      View venue →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {enquiringRoom && (
        <CorporateEventsModal
          isOpen={true}
          onClose={() => setEnquiringRoom(null)}
          venueName={enquiringRoom.venue.name}
          venueId={enquiringRoom.venue_id}
          roomName={enquiringRoom.name}
        />
      )}
    </div>
  )
}

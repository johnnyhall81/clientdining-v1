'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  }
}

const AREAS = ['Mayfair', 'City', 'Soho', 'St James\'s', 'Chelsea', 'Marylebone', 'Covent Garden', 'Canary Wharf', 'Knightsbridge']
const OCCASIONS = ['Client dinner', 'Drinks reception', 'Away day', 'Team dinner', 'Board meeting', 'Product launch', 'Celebration']

export default function PrivateHirePage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filterArea, setFilterArea] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [filterOccasion, setFilterOccasion] = useState('')
  const [enquiringRoom, setEnquiringRoom] = useState<Room | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('private_hire_rooms')
        .select(`
          *,
          venue:venues!inner(id, name, area, image_hero)
        `)
        .eq('is_active', true)
        .eq('venues.is_active', true)
        .order('display_order', { ascending: true })

      if (!error) setRooms((data || []) as any)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = rooms.filter(room => {
    if (filterArea && room.venue.area !== filterArea) return false
    if (filterOccasion && !room.best_for?.includes(filterOccasion)) return false
    if (filterGuests) {
      const n = parseInt(filterGuests)
      if (!isNaN(n)) {
        const maxCap = Math.max(
          room.capacity_dining || 0,
          room.capacity_standing || 0,
          room.capacity_boardroom || 0
        )
        if (maxCap > 0 && maxCap < n) return false
      }
    }
    return true
  })

  const clearFilters = () => {
    setFilterArea('')
    setFilterGuests('')
    setFilterOccasion('')
  }

  const hasFilters = filterArea || filterGuests || filterOccasion

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-light text-zinc-900 tracking-tight mb-1">Private hire</h1>
        <p className="text-sm font-light text-zinc-400">
          Private dining rooms and event spaces across London's best venues.
        </p>
      </div>

      {/* Filters — no card, just a clean strip */}
      <div className="space-y-3">

        {/* Guests + area + clear — inline row */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min="1"
            placeholder="Guests"
            value={filterGuests}
            onChange={e => setFilterGuests(e.target.value)}
            className="w-24 px-3 py-1.5 border border-zinc-200 text-sm font-light text-zinc-700 bg-white focus:outline-none focus:border-zinc-400 transition-colors"
            style={{ borderRadius: '3px' }}
          />
          <select
            value={filterArea}
            onChange={e => setFilterArea(e.target.value)}
            className="px-3 py-1.5 border border-zinc-200 text-sm font-light text-zinc-700 focus:outline-none focus:border-zinc-400 transition-colors bg-white"
            style={{ borderRadius: '3px' }}
          >
            <option value="">All areas</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-light text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Occasion chips */}
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map(o => (
            <button
              key={o}
              onClick={() => setFilterOccasion(filterOccasion === o ? '' : o)}
              className="px-3 py-1 text-xs font-light transition-colors"
              style={{
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterOccasion === o ? '#18181B' : '#E4E4E7',
                backgroundColor: filterOccasion === o ? '#18181B' : 'transparent',
                color: filterOccasion === o ? 'white' : '#71717A',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Results count — more legible */}
      {!loading && (
        <p className="text-sm font-light text-zinc-500">
          {filtered.length === 0
            ? 'No spaces found'
            : `${filtered.length} ${filtered.length === 1 ? 'private space' : 'private spaces'}`}
        </p>
      )}

      {/* Room cards */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-sm font-light text-zinc-400">Loading spaces…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-100">
          <p className="text-sm font-light text-zinc-400">No spaces match your filters.</p>
          <button onClick={clearFilters} className="mt-3 text-xs font-light text-zinc-500 hover:text-zinc-800 transition-colors underline underline-offset-2">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(room => {
            const mainImage = room.images?.find(i => i.is_main) || room.images?.[0]
            const heroImage = mainImage?.url || room.venue.image_hero

            return (
              <div
                key={room.id}
                className="bg-white overflow-hidden"
                style={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                {/* 4:3 image */}
                <Link href={`/venues/${room.venue_id}?tab=private_hire`} className="block relative overflow-hidden" style={{ paddingTop: '75%' }}>
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={room.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Space type top-left */}
                  <span className="absolute top-3 left-3 text-[9px] tracking-[0.18em] uppercase font-light text-white/80 bg-black/30 px-2 py-1 rounded">
                    {room.space_type === 'whole_venue' ? 'Whole venue' :
                     room.space_type === 'semi_private' ? 'Semi-private' : 'Private space'}
                  </span>
                  {/* Venue name bottom-left */}
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white/80 text-xs font-light">{room.venue.name}</p>
                    <p className="text-white/50 text-[11px] font-light">{room.venue.area}</p>
                  </div>
                </Link>

                {/* Content */}
                <div className="px-5 py-5">

                  {/* Room name */}
                  <h3 className="text-lg font-light text-zinc-900 tracking-tight mb-3">{room.name}</h3>

                  {/* Spec row — decision data first */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 pb-4" style={{ borderBottom: '1px solid #F0EDE9' }}>
                    {room.capacity_dining && (
                      <div>
                        <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">Dining</p>
                        <p className="text-xs font-light text-zinc-700">{room.capacity_dining} seated</p>
                      </div>
                    )}
                    {room.capacity_standing && (
                      <div>
                        <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">Standing</p>
                        <p className="text-xs font-light text-zinc-700">{room.capacity_standing} guests</p>
                      </div>
                    )}
                    {room.capacity_boardroom && (
                      <div>
                        <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">Boardroom</p>
                        <p className="text-xs font-light text-zinc-700">{room.capacity_boardroom} seats</p>
                      </div>
                    )}
                    {room.pricing_from && (
                      <div>
                        <p className="text-[8px] tracking-[0.18em] text-zinc-400 uppercase font-light mb-0.5">
                          {room.pricing_type === 'min_spend' ? 'Min spend' :
                           room.pricing_type === 'hire_fee' ? 'Hire fee' : 'From'}
                        </p>
                        <p className="text-xs font-light text-zinc-700">
                          £{room.pricing_from.toLocaleString()}{room.pricing_notes ? ` ${room.pricing_notes}` : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description — 2 lines max */}
                  {room.description && (
                    <p className="text-sm font-light text-zinc-500 leading-relaxed mb-4"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {room.description}
                    </p>
                  )}

                  {/* Best for tags */}
                  {room.best_for?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {room.best_for.map(tag => (
                        <span key={tag} className="text-[11px] font-light text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
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

      {/* Enquiry modal */}
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

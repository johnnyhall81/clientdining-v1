'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import Link from 'next/link'
import AlertToggle from '@/components/slots/AlertToggle'
import PremiumUnlockModal from '@/components/modals/PremiumUnlockModal'
import PartySizeModal from '@/components/modals/PartySizeModal'

interface SearchResult {
  slot: {
    id: string
    start_at: string
    party_min: number
    party_max: number
    slot_tier: 'free' | 'premium'
    status: string
  }
  venue: {
    id: string
    name: string
    area: string
    venue_type: string
    image_venue: string | null
  }
}

interface Venue {
  id: string
  name: string
}

export default function SearchPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [venues, setVenues] = useState<Venue[]>([])
  const [showPartySizeModal, setShowPartySizeModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [dinerTier, setDinerTier] = useState<'free' | 'premium'>('free')

  const [filters, setFilters] = useState({
    date: '',
    area: '',
    partySize: 2,
    within24h: false,
    tier: 'all' as 'all' | 'free' | 'premium',
    venueId: '',
  })

  // Load venues for dropdown
  useEffect(() => {
    const loadVenues = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (!error && data) {
        setVenues(data)
      }
    }
    loadVenues()
  }, [])

  // Load user tier
  useEffect(() => {
    const loadUserTier = async () => {
      if (!user) {
        setDinerTier('free')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('diner_tier')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setDinerTier(data.diner_tier)
      }
    }
    loadUserTier()
  }, [user])

  useEffect(() => {
    handleSearch()
    if (user) {
      loadAlerts()
    } else {
      setAlerts(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, filters.area, filters.partySize, filters.within24h, filters.tier, filters.venueId, user])

  useEffect(() => {
    if (!user) {
      setBookedSlots(new Set())
      return
    }
    if (!results.length) return

    const loadMyBookings = async () => {
      try {
        const slotIds = results.map((r) => r.slot.id)

        const { data, error } = await supabase
          .from('bookings')
          .select('slot_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .in('slot_id', slotIds)

        if (error) throw error

        setBookedSlots(new Set((data || []).map((b: any) => b.slot_id)))
      } catch (e) {
        console.error('Error loading bookings:', e)
      }
    }

    loadMyBookings()
  }, [user, results])

  const handleCancel = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = data?.error || 'Could not create booking'
        setBookingError(message)
        setBookingSlotId(null)
        return
      }
      
      setBookingError(null)

      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.delete(slotId)
        return next
      })
    } catch (e) {
      console.error('Cancel error:', e)
    }
  }

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()

      if (data.alerts) {
        const activeAlertSlotIds = data.alerts
          .filter((a: any) => a.status === 'active')
          .map((a: any) => a.slot_id)
        setAlerts(new Set(activeAlertSlotIds))
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const handleSearch = async () => {
    setLoading(true)

    let query = supabase
      .from('slots')
      .select(
        `
        id,
        start_at,
        party_min,
        party_max,
        slot_tier,
        status,
        venue_id,
        venues!inner (
          id,
          name,
          area,
          venue_type,
          image_venue
        )
      `
      )
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(50)

    if (filters.date) {
      const startOfDay = new Date(filters.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filters.date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query.gte('start_at', startOfDay.toISOString()).lte('start_at', endOfDay.toISOString())
    }

    if (filters.area) {
      query = query.eq('venues.area', filters.area)
    }

    if (filters.partySize) {
      query = query.lte('party_min', filters.partySize).gte('party_max', filters.partySize)
    }

    if (filters.within24h) {
      const in24h = new Date()
      in24h.setHours(in24h.getHours() + 24)
      query = query.lte('start_at', in24h.toISOString())
    }

    if (filters.tier !== 'all') {
      query = query.eq('slot_tier', filters.tier)
    }

    if (filters.venueId) {
      query = query.eq('venue_id', filters.venueId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Search error:', error)
      setResults([])
    } else {
      const mappedResults = (data || []).map((row: any) => ({
        slot: {
          id: row.id,
          start_at: row.start_at,
          party_min: row.party_min,
          party_max: row.party_max,
          slot_tier: row.slot_tier,
          status: row.status,
        },
        venue: row.venues,
      }))
      setResults(mappedResults)
    }

    setLoading(false)
  }

  const handleBook = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }
  
    const result = results.find(r => r.slot.id === slotId)
    if (!result) return
  
    setSelectedSlot({
      ...result.slot,
      venue: result.venue
    })
    setShowPartySizeModal(true)
  }

  
  const confirmBooking = async (partySize: number, notes?: string) => {
    if (!selectedSlot) return
  
    setBookingSlotId(selectedSlot.id)
    setBookingError(null)
  
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slotId: selectedSlot.id,
          partySize,
          notes,
        }),
      })
  
      const data = await response.json().catch(() => ({}))
  
      if (!response.ok) {
        const message = data?.error || 'Could not create booking'
        setBookingError(message)
        setBookingSlotId(null)
        return
      }

      setShowPartySizeModal(false)
      setBookingError(null)
      setSelectedSlot(null)

      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.add(selectedSlot.id)
        return next
      })
  
      router.push('/bookings')
      router.refresh()
    } catch (error) {
      console.error('Booking error:', error)
      setBookingError('Could not create booking. Please try again.')
    } finally {
      setBookingSlotId(null)
    }
  }




  const handleToggleAlert = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data?.error || 'Failed to update alert')
    }

    const newAlerts = new Set(alerts)
    if (data.active) newAlerts.add(slotId)
    else newAlerts.delete(slotId)
    setAlerts(newAlerts)
  }

  const isLastMinute = (startAt: string) => {
    const now = new Date()
    const slotTime = new Date(startAt)
    const hoursUntil = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntil <= 24
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-light text-zinc-900 mb-2">Search</h1>
        <p className="text-zinc-600 font-light">Find available tables across all venues</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-light text-zinc-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-light text-zinc-700 mb-2">Area</label>
            <select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light"
            >
              <option value="">All Areas</option>
              <option value="Mayfair">Mayfair</option>
              <option value="Soho">Soho</option>
              <option value="Covent Garden">Covent Garden</option>
              <option value="Fitzrovia">Fitzrovia</option>
              <option value="Marylebone">Marylebone</option>
              <option value="Knightsbridge">Knightsbridge</option>
              <option value="Chelsea">Chelsea</option>
              <option value="Notting Hill">Notting Hill</option>
              <option value="Shoreditch">Shoreditch</option>
              <option value="City of London">City of London</option>
              <option value="Canary Wharf">Canary Wharf</option>
            </select>
          </div>

          {/* Party Size */}
          <div>
            <label className="block text-sm font-light text-zinc-700 mb-2">Party Size</label>
            <select
              value={filters.partySize}
              onChange={(e) => setFilters({ ...filters, partySize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((size) => (
                <option key={size} value={size}>
                  {size} guests
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-light text-zinc-700 mb-2">Access</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value as 'all' | 'free' | 'premium' })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light"
            >
              <option value="all">All Tables</option>
              <option value="free">Free Access</option>
              <option value="premium">Premium Access</option>
            </select>
          </div>

          {/* Venue Filter */}
          <div>
            <label className="block text-sm font-light text-zinc-700 mb-2">Venue</label>
            <select
              value={filters.venueId}
              onChange={(e) => setFilters({ ...filters, venueId: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-light"
            >
              <option value="">All Venues</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>

          {/* Within 24h Checkbox */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.within24h}
                onChange={(e) => setFilters({ ...filters, within24h: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-200 accent-zinc-700 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-sm text-zinc-700 font-light">Within 24h</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent"></div>
          <p className="mt-4 text-zinc-600 font-light">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
          <p className="text-zinc-600 font-light">No slots found matching your criteria.</p>
          <p className="text-sm text-zinc-500 font-light mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map(({ slot, venue }) => {
            const lastMinute = isLastMinute(slot.start_at)
            const hasAlert = alerts.has(slot.id)
            const isBookedByMe = bookedSlots.has(slot.id)

            return (
              <div
                key={slot.id}
                className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  
                <Link
                  href={`/venues/${venue.id}`}
                  prefetch={true}
                  className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
                >




                    <div className="relative w-16 h-16 aspect-square bg-zinc-100 rounded overflow-hidden flex-shrink-0">
                  {venue.image_venue ? (
                    <Image
                      src={venue.image_venue}
                      alt={venue.name}
                      fill
                      sizes="64px"
                      quality={90}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-light">
                      No image
                    </div>
                  )}
                </div>
                    <div>
                      <h3 className="font-light text-lg text-zinc-900 hover:underline">{venue.name}</h3>
                      <p className="text-sm text-zinc-600 font-light">{venue.area}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
                        <span className="text-zinc-700 font-light">
                          {formatSlotDate(slot.start_at)} • {formatSlotTime(slot.start_at)}
                        </span>
                        <span className="text-zinc-600 font-light">
                            Typical table: {slot.party_min}-{slot.party_max} guests
                        </span>
                        {isBookedByMe && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-light">
                            Confirmed
                          </span>
                        )}
                        {slot.slot_tier === 'premium' && dinerTier === 'premium' && !isBookedByMe && (
                          <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full font-light">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                 
                  <div className="flex items-center gap-3">
                    {/* Action button: Cancel OR Book OR Alert */}
                    {isBookedByMe ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(slot.id)}
                        className="h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        Cancel
                      </button>
                    ) : slot.status === 'available' ? (
                      <div className="flex flex-col items-end">
                        {/* Check if slot is premium and user is free tier and >24h */}
                        {slot.slot_tier === 'premium' && dinerTier === 'free' && !lastMinute ? (
                          <button
                            onClick={() => setShowPremiumModal(true)}
                            className="h-10 px-6 text-sm font-light rounded-lg whitespace-nowrap bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 transition-colors flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Unlock
                          </button>
                        ) : slot.slot_tier === 'premium' && dinerTier === 'premium' ? (
                        <button
                          onClick={() => handleBook(slot.id)}
                          disabled={bookingSlotId === slot.id}
                          className={[
                            'h-9 px-5 text-sm font-light rounded-lg whitespace-nowrap transition-colors border border-zinc-300',
                            bookingSlotId === slot.id
                              ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed'
                              : 'bg-white text-zinc-900 hover:bg-zinc-50',
                          ].join(' ')}
                        >
                          {bookingSlotId === slot.id ? 'Booking...' : 'Book'}
                        </button>

                        ) : (
                        <button
                          onClick={() => handleBook(slot.id)}
                          disabled={bookingSlotId === slot.id}
                          className={[
                            'h-9 px-5 text-sm font-light rounded-lg whitespace-nowrap transition-colors border border-zinc-300',
                            bookingSlotId === slot.id
                              ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed'
                              : 'bg-white text-zinc-900 hover:bg-zinc-50',
                          ].join(' ')}
                        >
                          {bookingSlotId === slot.id ? 'Booking...' : 'Book'}
                        </button>
                        )}
                      </div>

                    ) : (
                      <AlertToggle isActive={hasAlert} onToggle={() => handleToggleAlert(slot.id)} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}


{!loading && results.length > 0 && (
  <div className="pt-2 text-sm text-zinc-500 font-light">
    Not seeing the right table?{" "}
    <a
      onClick={(e) => {
        e.preventDefault()
        const subject = encodeURIComponent('Table enquiry via ClientDining')
        const body = encodeURIComponent(
          `Venue:\nPreferred date:\nTime window:\nParty size:\nOccasion (optional):\nNotes (optional):\n`
        )
        window.open(
          `mailto:support@clientdining.com?subject=${subject}&body=${body}`,
          '_blank'
        )
      }}
      className="text-zinc-700 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
    >
      Ask us to check.
    </a>
  </div>
)}



      {/* Premium Unlock Modal */}
      <PremiumUnlockModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

{selectedSlot && (
  <PartySizeModal
    isOpen={showPartySizeModal}
    onClose={() => {
      setShowPartySizeModal(false)
      setSelectedSlot(null)
      setBookingError(null)
      setBookingSlotId(null)
    }}
    onConfirm={confirmBooking}
    minSize={selectedSlot.party_min}
    maxSize={selectedSlot.party_max}
    venueName={selectedSlot.venue?.name || 'Venue'}
    error={bookingError}
  />
)}



    </div>
  )
}

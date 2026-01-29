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
        const message = data?.error || 'Could not cancel booking'
        alert(message)
        return
      }
      
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

    // Filter by tier
    if (filters.tier !== 'all') {
      query = query.eq('slot_tier', filters.tier)
    }

    // Filter by venue
    if (filters.venueId) {
      query = query.eq('venue_id', filters.venueId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Search error:', error)
    } else {
      const transformed: SearchResult[] = (data || []).map((item: any) => ({
        slot: {
          id: item.id,
          start_at: item.start_at,
          party_min: item.party_min,
          party_max: item.party_max,
          slot_tier: item.slot_tier,
          status: item.status,
        },
        venue: item.venues,
      }))
      setResults(transformed)
    }

    setLoading(false)
  }

  const handleBook = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    setBookingSlotId(slotId)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = data?.error || 'Could not create booking'
        alert(message)
        setBookingSlotId(null)
        return
      }

      // flip this slot immediately to "Confirmed / Cancel"
      setBookedSlots((prev) => {
        const next = new Set(prev)
        next.add(slotId)
        return next
      })

      router.push('/bookings')
    } catch (error) {
      console.error('Booking error:', error)
      setBookingSlotId(null)
    }
  }

  const handleToggleAlert = async (slotId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    const isActive = alerts.has(slotId)

    try {
      const response = await fetch('/api/alerts', {
        method: isActive ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })

      if (response.ok) {
        setAlerts((prev) => {
          const next = new Set(prev)
          if (isActive) {
            next.delete(slotId)
          } else {
            next.add(slotId)
          }
          return next
        })
      }
    } catch (error) {
      console.error('Alert toggle error:', error)
    }
  }

  const isLastMinute = (startAt: string) => {
    const slotTime = new Date(startAt)
    const now = new Date()
    const hoursUntil = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntil <= 24
  }

  return (
    <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
      <p className="text-gray-600">View and search available tables</p>
    </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setFilters({
              date: '',
              area: '',
              partySize: 2,
              within24h: false,
              tier: 'all',
              venueId: '',
            })}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
            <select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">All Areas</option>
              <option value="Mayfair">Mayfair</option>
              <option value="Notting Hill">Notting Hill</option>
              <option value="Piccadilly">Piccadilly</option>
              <option value="Soho">Soho</option>
              <option value="Knightsbridge">Knightsbridge</option>
              <option value="Belgravia">Belgravia</option>
            </select>
          </div>

          {/* Party Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Party Size</label>
            <select
              value={filters.partySize}
              onChange={(e) => setFilters({ ...filters, partySize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => setFilters({ ...filters, tier: e.target.value as 'all' | 'free' | 'premium' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Venue Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
            <select
              value={filters.venueId}
              onChange={(e) => setFilters({ ...filters, venueId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-700">Within 24h</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No slots found matching your criteria.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/venues/${venue.id}`}
                    className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
                  >
                    {venue.image_venue && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={venue.image_venue}
                        alt={venue.name}
                        fill
                        sizes="64px"
                        className="rounded object-cover"
                      />
                    </div>
                  )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 hover:underline">{venue.name}</h3>
                      <p className="text-sm text-gray-600">{venue.area}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm flex-wrap">
                        <span className="text-gray-700">
                          {formatSlotDate(slot.start_at)} • {formatSlotTime(slot.start_at)}
                        </span>
                        <span className="text-gray-600">
                          {slot.party_min}-{slot.party_max} guests
                        </span>
                        {isBookedByMe && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Confirmed
                          </span>
                        )}
                        {slot.slot_tier === 'premium' && dinerTier === 'premium' && !isBookedByMe && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
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
                        className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    ) : slot.status === 'available' ? (
                      <div className="flex flex-col items-end">
                        {/* Check if slot is premium and user is free tier and >24h */}
                        {slot.slot_tier === 'premium' && dinerTier === 'free' && !lastMinute ? (
                          <button
                            onClick={() => setShowPremiumModal(true)}
                            className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
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
                            'h-9 px-5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors border border-gray-300',
                            bookingSlotId === slot.id
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-white text-gray-900 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          {bookingSlotId === slot.id ? 'Booking...' : 'Book'}
                        </button>

                        ) : (
                        <button
                          onClick={() => handleBook(slot.id)}
                          disabled={bookingSlotId === slot.id}
                          className={[
                            'h-9 px-5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors border border-gray-300',
                            bookingSlotId === slot.id
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-white text-gray-900 hover:bg-gray-50',
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

      {/* Premium Unlock Modal */}
      <PremiumUnlockModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  )
}

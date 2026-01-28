'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import { formatSlotDate, formatSlotTime } from '@/lib/date-utils'
import Link from 'next/link'
import AlertToggle from '@/components/slots/AlertToggle'

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

export default function SearchPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState({
    date: '',
    area: '',
    partySize: 2,
    within24h: false,
  })

  useEffect(() => {
    handleSearch()
    if (user) {
      loadAlerts()
    } else {
      setAlerts(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, filters.area, filters.partySize, filters.within24h, user])

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
        alert(message) // popup only
        setBookingSlotId(null)
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

  const isLastMinute = (startAt: string) => {
    const slotTime = new Date(startAt)
    const now = new Date()
    const hoursUntil = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntil <= 24
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Available Tables</h1>
        <p className="text-gray-600">Find and book your perfect dining experience</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
            <select
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Areas</option>
              <option value="Mayfair">Mayfair</option>
              <option value="Notting Hill">Notting Hill</option>
              <option value="Piccadilly">Piccadilly</option>
              <option value="Soho">Soho</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Party Size</label>
            <select
              value={filters.partySize}
              onChange={(e) => setFilters({ ...filters, partySize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((size) => (
                <option key={size} value={size}>
                  {size} guests
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.within24h}
                onChange={(e) => setFilters({ ...filters, within24h: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Within 24 hours</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No available slots found. Try adjusting your filters.</p>
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
                      <img
                        src={venue.image_venue}
                        alt={venue.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 hover:underline">{venue.name}</h3>
                      <p className="text-sm text-gray-600">{venue.area}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-gray-700">
                          {formatSlotDate(slot.start_at)} • {formatSlotTime(slot.start_at)}
                        </span>
                        <span className="text-gray-600">
                          {slot.party_min}-{slot.party_max} guests
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-3">
                    {/* Tier badges OR Confirmed */}
                    <div className="flex items-center gap-2 text-sm">
                      {isBookedByMe ? (
                        <span className="text-green-700 font-medium">Confirmed</span>
                      ) : (
                        <>
                          {slot.slot_tier === 'premium' && (
                            <span className="text-orange-600 font-medium">Premium</span>
                          )}
                          {slot.slot_tier === 'free' && (
                            <span className="text-green-600 font-medium">Free</span>
                          )}
                          {lastMinute && (
                            <span className="text-blue-600 font-medium">Last minute</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action button: Cancel OR Book OR Alert */}
                    {isBookedByMe ? (
                      <button
                        type="button"
                        onClick={() => handleCancel(slot.id)}
                        className="h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap bg-white border border-red-500 text-red-600 hover:bg-red-50 transition-colors"

                      >
                        Cancel
                      </button>
                    ) : slot.status === 'available' ? (
                      <div className="flex flex-col items-end">
                        <button
                          onClick={() => handleBook(slot.id)}
                          disabled={bookingSlotId === slot.id}
                          className={[
                            'h-10 px-6 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                            bookingSlotId === slot.id
                              ? 'bg-blue-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700',
                          ].join(' ')}
                          
                        >
                          {bookingSlotId === slot.id ? 'Booking…' : 'Book'}
                        </button>

                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertToggle
                          slotId={slot.id}
                          isActive={hasAlert}
                          requireLogin={!user}
                          onRequireLogin={() => router.push('/login')}
                          onStateChange={(nextActive) => {
                            const next = new Set(alerts)
                            if (nextActive) next.add(slot.id)
                            else next.delete(slot.id)
                            setAlerts(next)
                          }}
                        />

                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

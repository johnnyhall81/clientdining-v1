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
      .select(`
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
      `)
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(50)

    if (filters.date) {
      const startOfDay = new Date(filters.date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(filters.date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('start_at', startOfDay.toISOString())
        .lte('start_at', endOfDay.toISOString())
    }

    if (filters.area) {
      query = query.eq('venues.area', filters.area)
    }

    if (filters.partySize) {
      query = query
        .lte('party_min', filters.partySize)
        .gte('party_max', filters.partySize)
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

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to create booking')
        return
      }

      alert('Booking confirmed! Check your email for details.')
      router.push('/bookings')
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking')
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Size
            </label>
            <select
              value={filters.partySize}
              onChange={(e) => setFilters({ ...filters, partySize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((size) => (
                <option key={size} value={size}>{size} guests</option>
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
                    {/* Tier badges */}
                    <div className="flex items-center gap-2 text-sm">
                      {slot.slot_tier === 'premium' && (
                        <span className="text-orange-600 font-medium">Premium</span>
                      )}
                      {slot.slot_tier === 'free' && (
                        <span className="text-green-600 font-medium">Free</span>
                      )}
                      {lastMinute && (
                        <span className="text-blue-600 font-medium">Last minute</span>
                      )}
                    </div>

                    {/* Action button */}
                    {slot.status === 'available' ? (
                      <button
                        onClick={() => handleBook(slot.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
                      >
                        Book
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {slot.slot_tier === 'premium' && (
                          <span className="text-sm text-gray-500">🔒 Premium</span>
                        )}

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

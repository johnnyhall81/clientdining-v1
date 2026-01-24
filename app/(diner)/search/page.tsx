'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { formatSlotDate, formatSlotTime, isWithin24Hours } from '@/lib/date-utils'

interface SearchResult {
  id: string
  venue_id: string
  venue_name: string
  venue_area: string
  venue_type: string
  venue_image: string
  start_at: string
  party_min: number
  party_max: number
  slot_tier: string
}

export default function SearchPage() {
  const [date, setDate] = useState('')
  const [area, setArea] = useState('all')
  const [partySize, setPartySize] = useState('2')
  const [within24h, setWithin24h] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)

    try {
      let query = supabase
        .from('slots')
        .select(`
          id,
          venue_id,
          start_at,
          party_min,
          party_max,
          slot_tier,
          venues (
            name,
            area,
            venue_type,
            image_venue
          )
        `)
        .eq('status', 'available')
        .gte('start_at', new Date().toISOString())
        .lte('party_min', parseInt(partySize))
        .gte('party_max', parseInt(partySize))
        .order('start_at')

      // Filter by area if not "all"
      if (area !== 'all') {
        query = query.eq('venues.area', area)
      }

      // Filter by date if provided
      if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        query = query
          .gte('start_at', startOfDay.toISOString())
          .lte('start_at', endOfDay.toISOString())
      }

      // Filter by within 24h if checked
      if (within24h) {
        const in24h = new Date()
        in24h.setHours(in24h.getHours() + 24)
        query = query.lte('start_at', in24h.toISOString())
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data
      const transformed = (data || []).map((slot: any) => ({
        id: slot.id,
        venue_id: slot.venue_id,
        venue_name: slot.venues.name,
        venue_area: slot.venues.area,
        venue_type: slot.venues.venue_type,
        venue_image: slot.venues.image_venue,
        start_at: slot.start_at,
        party_min: slot.party_min,
        party_max: slot.party_max,
        slot_tier: slot.slot_tier,
      }))

      setResults(transformed)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Availability</h1>
        <p className="text-gray-600">Find your perfect dining experience</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All areas</option>
              <option value="Mayfair">Mayfair</option>
              <option value="Notting Hill">Notting Hill</option>
              <option value="Piccadilly">Piccadilly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Size
            </label>
            <select
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="2">2 guests</option>
              <option value="4">4 guests</option>
              <option value="6">6 guests</option>
              <option value="8">8 guests</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={within24h}
                onChange={(e) => setWithin24h(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Within 24 hours only</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search Availability'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div>
          {loading ? (
            <p className="text-center text-gray-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-500">
              Use the filters above and click "Search Availability" to find available tables
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Found {results.length} available {results.length === 1 ? 'slot' : 'slots'}
              </p>
              
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/venues/${result.venue_id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                      <img
                        src={result.venue_image || '/placeholder-venue.jpg'}
                        alt={result.venue_name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {result.venue_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {result.venue_area} • {result.venue_type}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-gray-900">
                          {formatSlotDate(result.start_at)} at {formatSlotTime(result.start_at)}
                        </span>
                        <span className="text-gray-600">
                          {result.party_min}-{result.party_max} guests
                        </span>
                        <span className={`text-xs font-medium ${
                          result.slot_tier === 'premium' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {result.slot_tier === 'premium' ? 'Premium' : 'Free'}
                        </span>
                        {isWithin24Hours(result.start_at) && (
                          <span className="text-xs font-medium text-blue-600">
                            Last minute
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

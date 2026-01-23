'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatSlotDate, formatSlotTime, isWithin24Hours } from '@/lib/date-utils'

// Mock search results - all available slots
const ALL_RESULTS = [
  {
    id: 'r1',
    venueName: 'The Ledbury',
    venueId: '1',
    venueArea: 'Notting Hill',
    venueType: 'restaurant',
    slotDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '19:30',
    partyMin: 2,
    partyMax: 4,
    slotTier: 'free',
    image: '/venues/ledbury-venue.jpg'
  },
  {
    id: 'r2',
    venueName: 'Gymkhana',
    venueId: '4',
    venueArea: 'Mayfair',
    venueType: 'restaurant',
    slotDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '20:00',
    partyMin: 2,
    partyMax: 6,
    slotTier: 'premium',
    image: '/venues/gymkhana-venue.jpg'
  },
  {
    id: 'r3',
    venueName: 'The Wolseley',
    venueId: '5',
    venueArea: 'Piccadilly',
    venueType: 'restaurant',
    slotDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '18:30',
    partyMin: 2,
    partyMax: 4,
    slotTier: 'free',
    image: '/venues/wolseley-venue.jpg'
  },
  {
    id: 'r4',
    venueName: "Annabel's",
    venueId: '3',
    venueArea: 'Mayfair',
    venueType: 'club',
    slotDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '21:00',
    partyMin: 4,
    partyMax: 6,
    slotTier: 'premium',
    image: '/venues/annabels-venue.jpg'
  },
  {
    id: 'r5',
    venueName: 'Core by Clare Smyth',
    venueId: '2',
    venueArea: 'Notting Hill',
    venueType: 'restaurant',
    slotDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '19:00',
    partyMin: 2,
    partyMax: 4,
    slotTier: 'premium',
    image: '/venues/core-venue.jpg'
  },
  {
    id: 'r6',
    venueName: '5 Hertford Street',
    venueId: '6',
    venueArea: 'Mayfair',
    venueType: 'club',
    slotDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '20:30',
    partyMin: 4,
    partyMax: 8,
    slotTier: 'premium',
    image: '/venues/hertford-venue.jpg'
  },
  {
    id: 'r7',
    venueName: 'The Ledbury',
    venueId: '1',
    venueArea: 'Notting Hill',
    venueType: 'restaurant',
    slotDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
    slotTime: '20:00',
    partyMin: 2,
    partyMax: 6,
    slotTier: 'free',
    image: '/venues/ledbury-venue.jpg'
  },
  {
    id: 'r8',
    venueName: 'The Wolseley',
    venueId: '5',
    venueArea: 'Piccadilly',
    venueType: 'restaurant',
    slotDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    slotTime: '12:30',
    partyMin: 2,
    partyMax: 6,
    slotTier: 'free',
    image: '/venues/wolseley-venue.jpg'
  }
]

export default function SearchPage() {
  const [dateFilter, setDateFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [partySize, setPartySize] = useState('2')
  const [within24h, setWithin24h] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [sortBy, setSortBy] = useState('soonest')
  
  const handleSearch = () => {
    setHasSearched(true)
  }
  
  // Filter results based on search criteria
  const filteredResults = ALL_RESULTS.filter(result => {
    // Filter by area
    if (areaFilter && result.venueArea !== areaFilter) {
      return false
    }
    
    // Filter by date
    if (dateFilter) {
      const resultDate = new Date(result.slotDate).toISOString().split('T')[0]
      if (resultDate !== dateFilter) {
        return false
      }
    }
    
    // Filter by party size
    const requestedSize = parseInt(partySize)
    if (requestedSize < result.partyMin || requestedSize > result.partyMax) {
      return false
    }
    
    // Filter by within 24h
    if (within24h && !isWithin24Hours(result.slotDate)) {
      return false
    }
    
    return true
  })
  
  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'soonest') {
      return new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime()
    }
    if (sortBy === 'tonight') {
      const aIsTonight = new Date(a.slotDate).toDateString() === new Date().toDateString()
      const bIsTonight = new Date(b.slotDate).toDateString() === new Date().toDateString()
      if (aIsTonight && !bIsTonight) return -1
      if (!aIsTonight && bIsTonight) return 1
      return new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime()
    }
    return 0
  })
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Availability
        </h1>
        <p className="text-gray-600">
          Find your perfect dining experience
        </p>
      </div>
      
      {/* Search filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All areas</option>
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
              value={partySize}
              onChange={(e) => setPartySize(e.target.value)}
              className="input-field"
            >
              <option value="2">2 guests</option>
              <option value="4">4 guests</option>
              <option value="6">6 guests</option>
              <option value="8">8+ guests</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={within24h}
                onChange={(e) => setWithin24h(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Within 24 hours only
              </span>
            </label>
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          className="btn-primary w-full md:w-auto"
        >
          Search Availability
        </button>
      </div>
      
      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {sortedResults.length} Available {sortedResults.length === 1 ? 'Table' : 'Tables'}
            </h2>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-48"
            >
              <option value="soonest">Sort by: Soonest</option>
              <option value="tonight">Sort by: Tonight</option>
            </select>
          </div>
          
          {sortedResults.length === 0 ? (
            <div className="card">
              <p className="text-gray-600 text-center py-8">
                No tables found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedResults.map((result) => (
                <Link key={result.id} href={`/venues/${result.venueId}`}>
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={result.image}
                          alt={result.venueName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {result.venueName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {result.venueArea} • <span className="capitalize">{result.venueType}</span>
                        </p>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            <strong>📅 {formatSlotDate(result.slotDate)}</strong> at {result.slotTime}
                          </p>
                          <p className="text-sm text-gray-600">
                            👥 {result.partyMin === result.partyMax 
                              ? `${result.partyMin}` 
                              : `${result.partyMin}-${result.partyMax}`} guests
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                              result.slotTier === 'premium' ? 'text-amber-600' : 'text-green-600'
                            }`}>
                              {result.slotTier === 'premium' ? '⭐ Premium' : '✓ Free'}
                            </span>
                            {isWithin24Hours(result.slotDate) && (
                              <span className="text-xs font-medium text-blue-600">
                                ⚡ Last minute
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      
      {!hasSearched && (
        <div className="card">
          <p className="text-gray-600 text-center py-8">
            Use the filters above and click "Search Availability" to find available tables
          </p>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Slot } from '@/lib/supabase'
import SlotRow from '@/components/slots/SlotRow'

// Mapping of venue IDs to image filenames
const VENUE_IMAGES: Record<string, string> = {
  '1': 'ledbury',
  '2': 'core',
  '3': 'annabels',
  '4': 'gymkhana',
  '5': 'wolseley',
  '6': 'hertford'
}

// Mock venue data - would normally come from Supabase
const MOCK_VENUES: Record<string, any> = {
  '1': {
    id: '1',
    name: 'The Ledbury',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    description: 'Two Michelin-starred fine dining restaurant showcasing the best of British produce with French techniques.',
    address: '127 Ledbury Road, Notting Hill, London W11 2AQ',
    is_active: true,
    created_at: new Date().toISOString()
  },
  '2': {
    id: '2',
    name: 'Core by Clare Smyth',
    area: 'Notting Hill',
    venue_type: 'restaurant',
    description: 'Three Michelin-starred British cuisine with an emphasis on British ingredients and seasonality.',
    address: '92 Kensington Park Road, Notting Hill, London W11 2PN',
    is_active: true,
    created_at: new Date().toISOString()
  },
  '3': {
    id: '3',
    name: "Annabel's",
    area: 'Mayfair',
    venue_type: 'club',
    description: 'One of London\'s most exclusive private members\' clubs, offering exceptional dining and entertainment.',
    address: '46 Berkeley Square, Mayfair, London W1J 5AT',
    is_active: true,
    created_at: new Date().toISOString()
  },
  '4': {
    id: '4',
    name: 'Gymkhana',
    area: 'Mayfair',
    venue_type: 'restaurant',
    description: 'Michelin-starred Indian cuisine inspired by colonial Indian gymkhana clubs.',
    address: '42 Albemarle Street, Mayfair, London W1S 4JH',
    is_active: true,
    created_at: new Date().toISOString()
  },
  '5': {
    id: '5',
    name: 'The Wolseley',
    area: 'Piccadilly',
    venue_type: 'restaurant',
    description: 'Grand European café-restaurant serving breakfast through dinner in elegant surroundings.',
    address: '160 Piccadilly, St. James\'s, London W1J 9EB',
    is_active: true,
    created_at: new Date().toISOString()
  },
  '6': {
    id: '6',
    name: '5 Hertford Street',
    area: 'Mayfair',
    venue_type: 'club',
    description: 'Exclusive private members\' club in a beautiful Georgian townhouse.',
    address: '5 Hertford Street, Mayfair, London W1J 7RJ',
    is_active: true,
    created_at: new Date().toISOString()
  }
}

const MOCK_SLOTS: Slot[] = [
  {
    id: 's1',
    venue_id: '1',
    start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 4,
    slot_tier: 'free',
    status: 'available',
    reserved_for_user_id: null,
    reserved_until: null,
    created_at: new Date().toISOString()
  },
  {
    id: 's2',
    venue_id: '1',
    start_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 6,
    slot_tier: 'premium',
    status: 'available',
    reserved_for_user_id: null,
    reserved_until: null,
    created_at: new Date().toISOString()
  },
  {
    id: 's3',
    venue_id: '1',
    start_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    party_min: 2,
    party_max: 4,
    slot_tier: 'free',
    status: 'available',
    reserved_for_user_id: null,
    reserved_until: null,
    created_at: new Date().toISOString()
  },
  // Wednesday 7pm - Premium
  {
    id: 's4',
    venue_id: '1',
    start_at: (() => {
      const d = new Date()
      const daysUntilWed = (3 - d.getDay() + 7) % 7 || 7
      d.setDate(d.getDate() + daysUntilWed)
      d.setHours(19, 0, 0, 0)
      return d.toISOString()
    })(),
    party_min: 2,
    party_max: 6,
    slot_tier: 'premium',
    status: 'available',
    reserved_for_user_id: null,
    reserved_until: null,
    created_at: new Date().toISOString()
  },
  // Thursday 7pm - Premium
  {
    id: 's5',
    venue_id: '1',
    start_at: (() => {
      const d = new Date()
      const daysUntilThu = (4 - d.getDay() + 7) % 7 || 7
      d.setDate(d.getDate() + daysUntilThu)
      d.setHours(19, 0, 0, 0)
      return d.toISOString()
    })(),
    party_min: 2,
    party_max: 6,
    slot_tier: 'premium',
    status: 'available',
    reserved_for_user_id: null,
    reserved_until: null,
    created_at: new Date().toISOString()
  }
]

export default function VenuePage() {
  const params = useParams()
  const venueId = params.venueId as string
  const venue = MOCK_VENUES[venueId] || MOCK_VENUES['1']
  
  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  
  const handleBook = async (slotId: string) => {
    console.log('Booking slot:', slotId)
    // Would call /api/bookings/create
  }
  
  const handleToggleAlert = async (slotId: string) => {
    const newAlerts = new Set(alerts)
    if (newAlerts.has(slotId)) {
      newAlerts.delete(slotId)
    } else {
      newAlerts.add(slotId)
    }
    setAlerts(newAlerts)
    // Would call /api/alerts/toggle
  }
  
  // Sort slots by date/time
  const sortedSlots = [...MOCK_SLOTS].sort((a, b) => 
    new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )
  
  return (
    <div className="space-y-8">
      {/* Hero header with image */}
      <div className="bg-gray-200 rounded-lg aspect-[21/9] overflow-hidden">
        <img 
          src={`/venues/${VENUE_IMAGES[venueId]}-food.jpg`}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Venue details */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {venue.name}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 mb-2">
              <span>{venue.area}</span>
              <span>•</span>
              <span className="capitalize">{venue.venue_type}</span>
            </div>
            <p className="text-sm text-gray-600">
              📍 {venue.address}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 max-w-3xl">
          {venue.description}
        </p>
      </div>
      
      {/* Available slots */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Tables
        </h2>
        
        <div>
          {sortedSlots.map((slot) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              dinerTier="free"
              currentFutureBookings={1}
              onBook={handleBook}
              isAlertActive={alerts.has(slot.id)}
              onToggleAlert={handleToggleAlert}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
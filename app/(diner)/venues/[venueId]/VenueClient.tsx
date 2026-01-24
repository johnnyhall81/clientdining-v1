'use client'

import { useState } from 'react'
import { Venue, Slot } from '@/lib/supabase'
import SlotRow from '@/components/slots/SlotRow'

interface VenueClientProps {
  venue: Venue
  slots: Slot[]
}

export default function VenueClient({ venue, slots }: VenueClientProps) {
  const [alerts, setAlerts] = useState<Set<string>>(new Set())
  
  const handleBook = async (slotId: string) => {
    console.log('Booking slot:', slotId)
    // Will implement in next phase
  }
  
  const handleToggleAlert = async (slotId: string) => {
    const newAlerts = new Set(alerts)
    if (newAlerts.has(slotId)) {
      newAlerts.delete(slotId)
    } else {
      newAlerts.add(slotId)
    }
    setAlerts(newAlerts)
    // Will implement in next phase
  }
  
  return (
    <div className="space-y-8">
      {/* Hero header with image */}
      <div className="bg-gray-200 rounded-lg aspect-[21/9] overflow-hidden">
        <img 
          src={venue.image_food || venue.image_venue || '/placeholder-venue.jpg'}
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
            {venue.address && (
              <p className="text-sm text-gray-600">
                📍 {venue.address}
              </p>
            )}
          </div>
        </div>
        
        {venue.description && (
          <p className="text-gray-700 max-w-3xl">
            {venue.description}
          </p>
        )}
      </div>
      
      {/* Available slots */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Tables
        </h2>
        
        {slots.length === 0 ? (
          <p className="text-gray-500">No tables available at this time.</p>
        ) : (
          <div>
            {slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                dinerTier="free"
                currentFutureBookings={0}
                onBook={handleBook}
                isAlertActive={alerts.has(slot.id)}
                onToggleAlert={handleToggleAlert}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

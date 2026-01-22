'use client'

import { useState } from 'react'
import BookingCard from '@/components/bookings/BookingCard'
import { Booking, Venue, Slot } from '@/lib/supabase'

// Mock data
const MOCK_BOOKINGS = [
  {
    booking: {
      id: 'b1',
      slot_id: 's1',
      diner_user_id: 'u1',
      party_size: 4,
      status: 'active' as const,
      notes_private: null,
      created_at: new Date().toISOString(),
      cancelled_at: null
    },
    venue: {
      id: 'v1',
      name: 'The Ledbury',
      area: 'Notting Hill',
      venue_type: 'restaurant' as const,
      description: '',
      is_active: true,
      created_at: new Date().toISOString()
    },
    slot: {
      id: 's1',
      venue_id: 'v1',
      start_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      party_min: 2,
      party_max: 6,
      slot_tier: 'free' as const,
      status: 'booked' as const,
      reserved_for_user_id: null,
      reserved_until: null,
      created_at: new Date().toISOString()
    }
  }
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  
  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }
    console.log('Cancelling booking:', bookingId)
    // Would call /api/bookings/cancel
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Bookings
        </h1>
        <p className="text-gray-600">
          Manage your restaurant reservations
        </p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Bookings list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'upcoming' && MOCK_BOOKINGS.map(({ booking, venue, slot }) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            venue={venue}
            slot={slot}
            onCancel={handleCancel}
          />
        ))}
        
        {activeTab === 'past' && (
          <div className="col-span-full text-center py-12 text-gray-600">
            No past bookings
          </div>
        )}
        
        {activeTab === 'cancelled' && (
          <div className="col-span-full text-center py-12 text-gray-600">
            No cancelled bookings
          </div>
        )}
      </div>
    </div>
  )
}

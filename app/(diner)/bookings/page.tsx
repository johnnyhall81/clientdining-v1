'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase-client'
import BookingCard from '@/components/bookings/BookingCard'
import { Booking, Venue, Slot } from '@/lib/supabase'

interface BookingWithDetails {
  booking: Booking
  venue: Venue
  slot: Slot
}

export default function BookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchBookings()
    }
  }, [user, authLoading, router])

  const fetchBookings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          slots (*),
          venues (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformed: BookingWithDetails[] = (data || []).map((item: any) => ({
        booking: {
          id: item.id,
          slot_id: item.slot_id,
          user_id: item.user_id,
          venue_id: item.venue_id,
          party_size: item.party_size,
          notes: item.notes,
          status: item.status,
          bill_amount_gbp: item.bill_amount_gbp,
          commission_amount_gbp: item.commission_amount_gbp,
          commission_paid: item.commission_paid,
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
        venue: item.venues,
        slot: item.slots,
      }))

      setBookings(transformed)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      // Call the cancel API endpoint
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel booking')
      }

      alert('Booking cancelled successfully. A confirmation email has been sent.')
      fetchBookings()
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking: ' + error.message)
    }
  }

  const filteredBookings = bookings.filter(({ booking, slot }) => {
    const isPast = new Date(slot.start_at) < new Date()
    
    if (activeTab === 'upcoming') {
      return booking.status === 'active' && !isPast
    } else if (activeTab === 'past') {
      return (booking.status === 'active' || booking.status === 'completed') && isPast
    } else {
      return booking.status === 'cancelled'
    }
  })

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
        <p className="text-gray-600">View and manage your restaurant reservations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cancelled'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">
              {activeTab === 'upcoming' && 'No upcoming bookings'}
              {activeTab === 'past' && 'No past bookings'}
              {activeTab === 'cancelled' && 'No cancelled bookings'}
            </p>
          </div>
        ) : (
          filteredBookings.map(({ booking, venue, slot }) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              venue={venue}
              slot={slot}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </div>
  )
}

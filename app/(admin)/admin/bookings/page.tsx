'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { formatFullDateTime } from '@/lib/date-utils'

interface BookingWithDetails {
  id: string
  status: string
  party_size: number
  created_at: string
  venue_name: string
  venue_area: string
  slot_start: string
  user_email: string
  user_name: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [filter])

  const loadBookings = async () => {
    setLoading(true)
    
    let query = supabase
      .from('bookings')
      .select(`
        id,
        status,
        party_size,
        created_at,
        venues (name, area),
        slots (start_at),
        profiles!bookings_user_id_fkey (email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter === 'active') {
      query = query.eq('status', 'active')
    } else if (filter === 'cancelled') {
      query = query.eq('status', 'cancelled')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading bookings:', error)
    } else {
      const transformed = (data || []).map((item: any) => ({
        id: item.id,
        status: item.status,
        party_size: item.party_size,
        created_at: item.created_at,
        venue_name: item.venues?.name || 'Unknown',
        venue_area: item.venues?.area || '',
        slot_start: item.slots?.start_at || '',
        user_email: item.profiles?.email || 'Unknown',
        user_name: item.profiles?.full_name || 'Unknown',
      }))
      setBookings(transformed)
    }
    
    setLoading(false)
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Cancel this booking?')) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      alert('Failed to cancel booking')
    } else {
      loadBookings()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Bookings</h1>
        <p className="text-gray-600 mt-2">Platform-wide booking overview</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('active')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'active'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'cancelled'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-center py-12">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No bookings found</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slot Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Party Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booked
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{booking.venue_name}</div>
                    <div className="text-sm text-gray-500">{booking.venue_area}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFullDateTime(booking.slot_start)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.user_name}</div>
                    <div className="text-sm text-gray-500">{booking.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.party_size} guests
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {booking.status === 'active' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

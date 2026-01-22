'use client'

import { useState } from 'react'
import { formatFullDateTime } from '@/lib/date-utils'

// Mock bookings data
const MOCK_BOOKINGS = [
  {
    id: 'b1',
    diner_name: 'J.S.',
    diner_email: 'j***@example.com',
    slot_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    party_size: 4,
    status: 'active',
    notes_private: 'Birthday celebration',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b2',
    diner_name: 'M.B.',
    diner_email: 'm***@example.com',
    slot_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    party_size: 2,
    status: 'active',
    notes_private: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b3',
    diner_name: 'S.J.',
    diner_email: 's***@example.com',
    slot_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    party_size: 6,
    status: 'active',
    notes_private: 'Anniversary dinner',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'b4',
    diner_name: 'E.W.',
    diner_email: 'e***@example.com',
    slot_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    party_size: 4,
    status: 'completed',
    notes_private: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function VenueBookingsPage() {
  const [filter, setFilter] = useState('upcoming')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const handleCancel = (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? The diner will be notified.')) {
      return
    }
    console.log('Cancelling booking:', bookingId)
    setSelectedBooking(null)
  }

  const now = new Date()
  const filteredBookings = MOCK_BOOKINGS.filter(booking => {
    const bookingDate = new Date(booking.slot_date)
    
    if (filter === 'upcoming') {
      return booking.status === 'active' && bookingDate > now
    }
    if (filter === 'past') {
      return booking.status === 'completed' || (booking.status === 'active' && bookingDate < now)
    }
    if (filter === 'cancelled') {
      return booking.status === 'cancelled'
    }
    return true
  })

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage reservations for your venue</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Diner</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Party Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">
                        {formatFullDateTime(booking.slot_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{booking.diner_name}</div>
                        <div className="text-sm text-gray-600">{booking.diner_email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{booking.party_size} guests</td>
                      <td className="py-3 px-4 text-gray-600">
                        {booking.notes_private ? (
                          <span className="text-sm">{booking.notes_private.substring(0, 20)}...</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          booking.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-600">Diner:</span>
                <p className="text-gray-900">{selectedBooking.diner_name}</p>
                <p className="text-sm text-gray-600">{selectedBooking.diner_email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Date & Time:</span>
                <p className="text-gray-900">{formatFullDateTime(selectedBooking.slot_date)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Party Size:</span>
                <p className="text-gray-900">{selectedBooking.party_size} guests</p>
              </div>
              {selectedBooking.notes_private && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Notes:</span>
                  <p className="text-gray-900">{selectedBooking.notes_private}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full capitalize ${
                  selectedBooking.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : selectedBooking.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {selectedBooking.status === 'active' && new Date(selectedBooking.slot_date) > now && (
                <button
                  onClick={() => handleCancel(selectedBooking.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
              
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
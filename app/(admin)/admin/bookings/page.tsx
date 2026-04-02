'use client'

import { useEffect, useState } from 'react'
import { formatFullDateTime } from '@/lib/date-utils'

interface BookingWithDetails {
  id: string
  status: string
  created_at: string
  party_size: number
  notes?: string
  guest_names?: string[]
  booking_source?: string
  booked_at?: string
  slots: {
    start_at: string
    party_min: number
    party_max: number
  } | null
  venues: {
    name: string
    area: string
  }
  profiles: {
    full_name: string
    email: string
  } | null
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/bookings')
      const data = await response.json()
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'active') return booking.status === 'active'
    if (filter === 'cancelled') return booking.status === 'cancelled'
    return true
  })

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-2">View all platform bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'active', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                filter === f
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({
                f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length
              })
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booked On</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => {
              const isExpanded = expandedId === booking.id
              const hasGuests = booking.guest_names && booking.guest_names.length > 0
              const hasNotes = !!booking.notes

              return (
                <>
                  <tr
                    key={booking.id}
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className={`hover:bg-gray-50 ${hasGuests || hasNotes ? 'cursor-pointer' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.profiles ? (
                        <>
                          <div className="font-medium text-gray-900">{booking.profiles.full_name}</div>
                          <div className="text-sm text-gray-500">{booking.profiles.email}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 italic">
                          Guest ({booking.booking_source === 'opentable' ? 'OpenTable' : 'Unknown'})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{booking.venues?.name}</div>
                      <div className="text-sm text-gray-500">{booking.venues?.area}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {booking.slots
                        ? formatFullDateTime(booking.slots.start_at)
                        : booking.booked_at
                        ? new Date(booking.booked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span className="text-gray-400 text-sm">Via restaurant</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {booking.party_size
                        ? `${booking.party_size} guests`
                        : booking.slots
                        ? `${booking.slots.party_min}–${booking.slots.party_max} guests`
                        : '—'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        booking.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center justify-between gap-4">
                        {new Date(booking.created_at).toLocaleDateString()}
                        {(hasGuests || hasNotes) && (
                          <span className="text-gray-300 text-xs">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (hasGuests || hasNotes) && (
                    <tr key={`${booking.id}-detail`} className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex gap-12 text-sm">
                          {hasGuests && (
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Guests</p>
                              <div className="space-y-0.5">
                                {booking.guest_names!.map((name, i) => (
                                  <p key={i} className="text-gray-700">{name}</p>
                                ))}
                              </div>
                            </div>
                          )}
                          {hasNotes && (
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Note</p>
                              <p className="text-gray-700">{booking.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No {filter !== 'all' ? filter : ''} bookings found
          </div>
        )}
      </div>
    </div>
  )
}

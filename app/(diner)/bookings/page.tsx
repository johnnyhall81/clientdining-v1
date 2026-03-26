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
  slot: Slot | null
}

export default function BookingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [bookerName, setBookerName] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Seed immediately from auth metadata so the card never shows 'Host'
      const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || ''
      setBookerName(metaName)

      fetchBookings()
      supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setBookerName(data.full_name)
        })
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
          guest_names: item.guest_names,
          private_notes: item.private_notes,
          status: item.status,
          bill_amount_gbp: item.bill_amount_gbp,
          commission_amount_gbp: item.commission_amount_gbp,
          commission_paid: item.commission_paid,
          created_at: item.created_at,
          updated_at: item.updated_at,
          booking_source: item.booking_source,
          booked_at: item.booked_at,
          sevenrooms_reservation_id: item.sevenrooms_reservation_id,
        },
        venue: item.venues,
        slot: item.slots || null,
      }))

      setBookings(transformed)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel booking')
      }

      // Update state directly — no need to re-fetch
      setBookings((prev) =>
        prev.map((b) =>
          b.booking.id === bookingId
            ? { ...b, booking: { ...b.booking, status: 'cancelled' } }
            : b
        )
      )
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
    }
  }

  const filteredBookings = bookings.filter(({ booking, slot }) => {
    const dateStr = slot?.start_at || (booking as any).booked_at || booking.created_at
    const isPast = new Date(dateStr) < new Date()

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
        <p className="text-zinc-500 font-light">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-100 pb-0">
        {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-3 text-sm font-light transition-colors capitalize ${
              activeTab === tab
                ? 'text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-500'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-900" />
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            {activeTab === 'upcoming' ? (
              <>
                <p className="text-sm font-light text-zinc-500 mb-1">No upcoming bookings</p>
                <p className="text-sm font-light text-zinc-400 mb-6">When you book a table, it will appear here.</p>
                <a
                  href="/home"
                  className="inline-flex items-center h-10 px-7 text-xs font-light tracking-widest uppercase text-white bg-zinc-900 hover:bg-zinc-700 transition-colors"
                  style={{ borderRadius: '3px' }}
                >
                  Browse venues
                </a>
              </>
            ) : (
              <p className="text-sm font-light text-zinc-400">
                {activeTab === 'past' ? 'No past bookings yet.' : 'No cancelled bookings.'}
              </p>
            )}
          </div>
        ) : (
          filteredBookings.filter(({ venue }) => venue).map(({ booking, venue, slot }) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              venue={venue}
              slot={slot}
              bookerName={bookerName}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </div>
  )
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { venueId, payload } = body

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Extract useful fields from the SevenRooms payload
    const reservationId = payload?.reservation_id || payload?.id || null
    const partySize = payload?.party_size || payload?.covers || null
    const bookedAt = payload?.date
      ? new Date(payload.date).toISOString()
      : new Date().toISOString()

    // Write to sevenrooms_bookings for raw payload retention
    await supabase.from('sevenrooms_bookings').insert({
      user_id: user?.id || null,
      venue_id: venueId,
      sevenrooms_reservation_id: reservationId,
      party_size: partySize,
      booked_at: bookedAt,
      status: 'confirmed',
      raw_payload: payload,
    })

    // Write to main bookings table for unified MyBookings view
    if (user?.id) {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        venue_id: venueId,
        slot_id: null,
        party_size: partySize,
        status: 'active',
        booking_source: 'sevenrooms',
        sevenrooms_reservation_id: reservationId,
        booked_at: bookedAt,
      })

      if (error) {
        console.error('bookings insert error:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SevenRooms booking capture error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

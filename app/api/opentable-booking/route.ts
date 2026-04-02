import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000'

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

    const confirmationNumber = payload?.confirmationNumber?.toString() || null
    const partySize = payload?.partySize || null
    const bookedAt = payload?.reservationDateTime
      ? new Date(payload.reservationDateTime).toISOString()
      : null

    const { error } = await supabase.from('bookings').insert({
      user_id: user?.id || GUEST_USER_ID,
      venue_id: venueId,
      slot_id: null,
      party_size: partySize,
      status: 'active',
      booking_source: 'opentable',
      sevenrooms_reservation_id: confirmationNumber,
      booked_at: bookedAt,
    })

    if (error) {
      console.error('OpenTable bookings insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('OpenTable booking capture error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

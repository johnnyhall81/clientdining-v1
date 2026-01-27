import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/email/send-booking-confirmation'
import { formatFullDateTime } from '@/lib/date-utils'

export async function POST(request: Request) {
  try {
    const { slotId } = await request.json()

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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    // Get slot details with venue info
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('venue_id, party_min, status, slot_tier, start_at, venues(name, address)')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (slot.status !== 'available') {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 400 })
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('diner_tier, email, full_name')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check tier restrictions for premium slots
    if (slot.slot_tier === 'premium' && profile.diner_tier === 'free') {
      const slotTime = new Date(slot.start_at)
      const now = new Date()
      const hoursUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (hoursUntilSlot > 24) {
        return NextResponse.json(
          {
            error:
              'Premium membership required to book this slot in advance. Upgrade to Premium or book within 24 hours.',
          },
          { status: 403 }
        )
      }
    }

    // ✅ Booking limits: count FUTURE bookings only (past bookings don't count)
    // This is based on the slot's start_at, since bookings doesn't store slot time.
    const nowIso = new Date().toISOString()

    const { data: futureBookingRows, error: futureCountError } = await supabase
      .from('bookings')
      .select('slot_id, slots!inner(start_at)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('slots.start_at', nowIso)

    if (futureCountError) {
      console.error('Future booking count error:', futureCountError)
      return NextResponse.json({ error: 'Failed to validate booking limits' }, { status: 500 })
    }

    const currentFutureBookings = futureBookingRows?.length || 0
    const maxBookings = profile.diner_tier === 'premium' ? 10 : 3

    if (currentFutureBookings >= maxBookings) {
      return NextResponse.json(
        {
          error: `Booking limit reached (${currentFutureBookings}/${maxBookings}). ${
            profile.diner_tier === 'free'
              ? 'Free users can have up to 3 future bookings. Upgrade to Premium for 10.'
              : 'Premium users can have up to 10 future bookings.'
          }`,
        },
        { status: 403 }
      )
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase.rpc('create_booking', {
      p_slot_id: slotId,
      p_user_id: user.id,
      p_venue_id: slot.venue_id,
      p_party_size: slot.party_min,
    })

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 400 })
    }

    // Send confirmation email (async, don't wait for it)
    const venue = (slot as any).venues
    sendBookingConfirmation({
      userEmail: profile.email,
      userName: profile.full_name || 'Guest',
      venueName: venue?.name || 'Venue',
      venueAddress: venue?.address || 'London',
      slotTime: formatFullDateTime(slot.start_at),
      partySize: slot.party_min,
      bookingId: booking.id || slotId,
    }).catch((err) => console.error('Email send failed:', err))

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 })
  }
}

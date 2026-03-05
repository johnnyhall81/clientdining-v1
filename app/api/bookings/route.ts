import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/email/send-booking-confirmation'
import { formatFullDateTime } from '@/lib/date-utils'

export async function POST(request: Request) {
  try {
    const { slotId, partySize, notes, guestNames } = await request.json()

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
      .select('venue_id, party_min, party_max, status, slot_tier, start_at, venues(name, area, address, postcode, phone, booking_email, image_hero)')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    if (slot.status !== 'available') {
      return NextResponse.json({ error: 'Slot is no longer available' }, { status: 400 })
    }

    if (!partySize || partySize < slot.party_min || partySize > (slot as any).party_max) {
      return NextResponse.json(
        { error: `Party size must be between ${slot.party_min} and ${(slot as any).party_max} guests` },
        { status: 400 }
      )
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase.rpc('create_booking', {
      p_slot_id: slotId,
      p_user_id: user.id,
      p_venue_id: slot.venue_id,
      p_party_size: partySize,
      p_notes: notes || null,
    })

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 400 })
    }

    // Store guest names if provided
    if (guestNames && Array.isArray(guestNames) && guestNames.length > 0) {
      await supabase
        .from('bookings')
        .update({ guest_names: guestNames })
        .eq('id', booking.id)
    }

    // Send confirmation email
    const venue = (slot as any).venues
    console.log('📧 About to send booking email to:', profile.email)
    console.log('📧 Venue data:', venue)
    console.log('📧 Booking ID:', booking.id || slotId)

    await sendBookingConfirmation({
      userEmail: profile.email,
      userName: profile.full_name || 'Guest',
      venueName: venue?.name || 'Venue',
      venueArea: venue?.area,
      venueAddress: venue?.address || 'London',
      venuePostcode: venue?.postcode || '',
      venuePhone: venue?.phone,
      venueEmail: venue?.booking_email,
      venueImageUrl: venue?.image_hero,
      slotTime: formatFullDateTime(slot.start_at),
      slotStartISO: slot.start_at,
      partySize: partySize,
      bookingId: booking.id || slotId,
      guestNames: guestNames || undefined,
    }).catch((err) => console.error('Email send failed:', err))

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 })
  }
}

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendCancellationConfirmation } from '@/lib/email/send-cancellation-confirmation'
import { formatFullDateTime } from '@/lib/date-utils'

export async function POST(request: Request) {
  try {
    // ✅ accept either bookingId (Bookings page) OR slotId (Venue/Search)
    const body = await request.json().catch(() => ({}))
    const bookingIdFromBody: string | undefined = body.bookingId
    const slotIdFromBody: string | undefined = body.slotId

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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ resolve bookingId if caller passed slotId
    let bookingId = bookingIdFromBody

    if (!bookingId && slotIdFromBody) {
      const { data: bookingRow, error: findError } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('slot_id', slotIdFromBody)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (findError) {
        return NextResponse.json({ error: findError.message }, { status: 400 })
      }

      if (!bookingRow?.id) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      bookingId = bookingRow.id
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId or slotId' }, { status: 400 })
    }

    // Get booking details before cancelling
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        slots (start_at),
        venues (name),
        profiles!bookings_user_id_fkey (email, full_name)
      `)
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Cancel the booking
    const { error: cancelError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', user.id) // ✅ tiny safety improvement

    if (cancelError) throw cancelError

    // Update slot back to available
    await supabase
      .from('slots')
      .update({ status: 'available' })
      .eq('id', booking.slot_id)

    // Send cancellation email
    const profile = (booking as any).profiles
    const venue = (booking as any).venues
    const slot = (booking as any).slots

    sendCancellationConfirmation({
      userEmail: profile?.email || user.email!,
      userName: profile?.full_name || 'Guest',
      venueName: venue?.name || 'Venue',
      slotTime: formatFullDateTime(slot?.start_at || new Date().toISOString()),
      partySize: booking.party_size,
      bookingId: booking.id,
    }).catch(err => console.error('Email send failed:', err))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancellation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

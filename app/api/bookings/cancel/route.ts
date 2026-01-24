import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendCancellationConfirmation } from '@/lib/email/send-cancellation-confirmation'
import { formatFullDateTime } from '@/lib/date-utils'

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()
    
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

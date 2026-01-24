import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in' },
        { status: 401 }
      )
    }

    // Get slot details
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('venue_id, party_min, status, slot_tier, start_at')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
    }

    // Check if slot is still available
    if (slot.status !== 'available') {
      return NextResponse.json(
        { error: 'Slot is no longer available' },
        { status: 400 }
      )
    }

    // Get user's profile to check tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check tier restrictions for premium slots
    if (slot.slot_tier === 'premium' && profile.tier === 'free') {
      const slotTime = new Date(slot.start_at)
      const now = new Date()
      const hoursUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      // Free users can only book premium slots within 24 hours
      if (hoursUntilSlot > 24) {
        return NextResponse.json(
          { error: 'Premium membership required to book this slot in advance. Upgrade to Premium or book within 24 hours.' },
          { status: 403 }
        )
      }
    }

    // Check booking limits
    const { count: currentBookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('slots.start_at', new Date().toISOString())

    const maxBookings = profile.tier === 'premium' ? 10 : 3

    if ((currentBookings || 0) >= maxBookings) {
      return NextResponse.json(
        { 
          error: `Booking limit reached. ${profile.tier === 'free' ? 'Free users can have up to 3 future bookings. Upgrade to Premium for 10 bookings.' : 'Premium users can have up to 10 future bookings.'}` 
        },
        { status: 403 }
      )
    }

    // Call the database function to create booking atomically
    const { data, error: bookingError } = await supabase
      .rpc('create_booking', {
        p_slot_id: slotId,
        p_user_id: user.id,
        p_venue_id: slot.venue_id,
        p_party_size: slot.party_min,
      })

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json(
        { error: bookingError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ booking: data })
  } catch (error: any) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}

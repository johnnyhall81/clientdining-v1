import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAlertNotification } from '@/lib/email/send-alert-notification'
import { formatFullDateTime } from '@/lib/date-utils'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { bookingId, reason } = await request.json()
    
    // Get authenticated user
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

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        slot_id,
        user_id,
        status,
        slots!inner (
          id,
          start_at,
          venue_id,
          party_min,
          party_max
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permission
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isOwner = booking.user_id === user.id
    const isAdmin = profile?.role === 'platform_admin' || profile?.role === 'venue_admin'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    if (booking.status !== 'active') {
      return NextResponse.json({ error: 'Booking is not active' }, { status: 400 })
    }

    // Cancel the booking
// Cancel the booking
// Cancel the booking
const { error: cancelError } = await supabaseAdmin
  .from('bookings')
  .update({ 
    status: 'cancelled', 
    cancelled_at: new Date().toISOString(),
    cancelled_by: user.id
    // updated_at is set automatically by trigger
  })
  .eq('id', bookingId)

    if (cancelError) {
      throw cancelError
    }

    // Reopen the slot
    const { error: slotError } = await supabaseAdmin
      .from('slots')
      .update({ status: 'available' })
      .eq('id', booking.slot_id)

    if (slotError) {
      throw slotError
    }

    // Calculate hours until slot
    const slotStartAt = (booking.slots as any).start_at
    const hoursUntil = (new Date(slotStartAt).getTime() - Date.now()) / (1000 * 60 * 60)

    console.log(`📅 Slot starts in ${hoursUntil.toFixed(1)} hours`)

    // PROCESS ALERTS IMMEDIATELY
    if (hoursUntil <= 24) {
      // Strategy A: BLAST NOTIFICATION (<24 hours)
      console.log('⚡ Blast notification mode (<24h)')
      
      await processBlastNotification(booking.slot_id, booking.slots as any)
      
    } else {
      // Strategy B: FIFO QUEUE (>24 hours)
      console.log('📋 FIFO queue mode (>24h)')
      
      await processFIFONotification(booking.slot_id, booking.slots as any)
    }

    // Audit log
    await supabaseAdmin
      .from('audit_log')
      .insert({
        actor_user_id: user.id,
        actor_role: profile?.role || 'diner',
        action: 'cancel_booking',
        object_type: 'booking',
        object_id: bookingId,
        metadata: { reason, slot_id: booking.slot_id }
      })

    return NextResponse.json({ 
      success: true,
      message: 'Booking cancelled successfully'
    })

  } catch (error: any) {
    console.error('❌ Cancel booking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

// BLAST NOTIFICATION: Notify all users immediately
async function processBlastNotification(slotId: string, slot: any) {
  try {
    console.log('🔔 Starting blast notification...')

    // Get all active alerts for this slot
    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from('slot_alerts')
      .select(`
        id,
        diner_user_id,
        slot_id
      `)
      .eq('slot_id', slotId)
      .eq('status', 'active')

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError)
      return
    }

    if (!alerts || alerts.length === 0) {
      console.log('No active alerts for this slot')
      return
    }

    console.log(`📧 Found ${alerts.length} users to notify`)

    // Get venue details
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, name, area, venue_type, description')
      .eq('id', slot.venue_id)
      .single()

    if (!venue) {
      console.error('Venue not found')
      return
    }

    // Update all alerts to 'notified' status immediately
    const { error: updateError } = await supabaseAdmin
      .from('slot_alerts')
      .update({ 
        status: 'notified',
        notified_at: new Date().toISOString()
      })
      .eq('slot_id', slotId)
      .eq('status', 'active')

    if (updateError) {
      console.error('Error updating alert statuses:', updateError)
    }

    // Send emails in parallel (don't wait)
    const emailPromises = alerts.map(async (alert) => {
      try {
        // Get auth user for email
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
          alert.diner_user_id
        )

        if (!authUser?.user?.email) return

        // Get full name from user metadata
        const fullName = authUser.user.user_metadata?.full_name || 
                        authUser.user.user_metadata?.name ||
                        authUser.user.email?.split('@')[0] ||
                        'Guest'

        await sendAlertNotification({
          userEmail: authUser.user.email,
          userName: fullName,
          venueName: venue.name,
          venueAddress: venue.area || 'London',
          slotTime: formatFullDateTime(slot.start_at),
          partySize: `${slot.party_min}-${slot.party_max} guests`,
          slotId: slotId,
          venueId: venue.id,
        })

        console.log(`✅ Email sent to ${authUser.user.email}`)
      } catch (err) {
        console.error(`❌ Failed to send email for alert ${alert.id}:`, err)
      }
    })

    // Fire and forget - don't wait for all emails
    Promise.all(emailPromises).then(() => {
      console.log(`🎉 Blast notification complete: ${alerts.length} emails sent`)
    })

  } catch (error) {
    console.error('❌ Blast notification error:', error)
  }
}

// FIFO NOTIFICATION: Notify first person in queue with 15-min reservation
async function processFIFONotification(slotId: string, slot: any) {
  try {
    console.log('🎯 Starting FIFO notification...')

    // Get oldest active alert (first in queue)
    const { data: nextAlert, error: alertError } = await supabaseAdmin
      .from('slot_alerts')
      .select(`
        id,
        diner_user_id,
        slot_id,
        created_at
      `)
      .eq('slot_id', slotId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (alertError || !nextAlert) {
      console.log('No users in queue for this slot')
      return
    }

    console.log(`👤 Next user in queue: ${nextAlert.diner_user_id}`)

    // Reserve slot for this user (15 minutes)
    const reserveUntil = new Date(Date.now() + 15 * 60 * 1000)
    
    const { error: reserveError } = await supabaseAdmin
      .from('slots')
      .update({
        reserved_for_user_id: nextAlert.diner_user_id,
        reserved_until: reserveUntil.toISOString()
      })
      .eq('id', slotId)

    if (reserveError) {
      console.error('Error reserving slot:', reserveError)
      return
    }

    // Update alert to 'notified'
    const { error: updateError } = await supabaseAdmin
      .from('slot_alerts')
      .update({ 
        status: 'notified',
        notified_at: new Date().toISOString()
      })
      .eq('id', nextAlert.id)

    if (updateError) {
      console.error('Error updating alert:', updateError)
      return
    }

    // Get venue details
    const { data: venue } = await supabaseAdmin
      .from('venues')
      .select('id, name, area')
      .eq('id', slot.venue_id)
      .single()

    if (!venue) {
      console.error('Venue not found')
      return
    }

    // Get user details and send email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      nextAlert.diner_user_id
    )

    if (!authUser?.user?.email) {
      console.error('User email not found')
      return
    }

    const fullName = authUser.user.user_metadata?.full_name || 
                    authUser.user.user_metadata?.name ||
                    authUser.user.email?.split('@')[0] ||
                    'Guest'

    // Send email immediately
    await sendAlertNotification({
      userEmail: authUser.user.email,
      userName: fullName,
      venueName: venue.name,
      venueAddress: venue.area || 'London',
      slotTime: formatFullDateTime(slot.start_at),
      partySize: `${slot.party_min}-${slot.party_max} guests`,
      slotId: slotId,
      venueId: venue.id,
    })

    console.log(`✅ FIFO notification sent to ${authUser.user.email}`)
    console.log(`⏰ Reservation expires at ${reserveUntil.toISOString()}`)

  } catch (error) {
    console.error('❌ FIFO notification error:', error)
  }
}
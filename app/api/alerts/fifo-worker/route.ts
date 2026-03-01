import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAlertNotification } from '@/lib/email/send-alert-notification'
import { formatFullDateTime } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify this is a legitimate cron request
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('⚠️  CRON_SECRET not set - endpoint is unprotected!')
    return true // Allow in development
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  // Verify authorization
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Starting FIFO queue worker...')
    
    // Find all slots with expired reservations
    const { data: expiredSlots, error: slotsError } = await supabaseAdmin
      .from('slots')
      .select('id, venue_id, start_at, party_min, party_max, reserved_for_user_id')
      .eq('status', 'available')
      .not('reserved_until', 'is', null)
      .lt('reserved_until', new Date().toISOString())

    if (slotsError) {
      throw slotsError
    }

    if (!expiredSlots || expiredSlots.length === 0) {
      console.log('✅ No expired reservations to process')
      return NextResponse.json({ 
        success: true,
        message: 'No expired reservations',
        processed: 0
      })
    }

    console.log(`⏰ Found ${expiredSlots.length} expired reservations`)

    let processed = 0
    let errors = 0

    // Process each expired slot
    for (const slot of expiredSlots) {
      try {
        console.log(`\n📍 Processing slot ${slot.id}`)

        // 1. Clear the expired reservation
        const { error: clearError } = await supabaseAdmin
          .from('slots')
          .update({
            reserved_for_user_id: null,
            reserved_until: null
          })
          .eq('id', slot.id)

        if (clearError) {
          console.error('Error clearing reservation:', clearError)
          errors++
          continue
        }

        console.log('  ✓ Cleared expired reservation')

        // 2. Mark the current notified alert as expired
        if (slot.reserved_for_user_id) {
          const { error: expireError } = await supabaseAdmin
            .from('slot_alerts')
            .update({ status: 'expired' })
            .eq('slot_id', slot.id)
            .eq('diner_user_id', slot.reserved_for_user_id)
            .eq('status', 'notified')

          if (expireError) {
            console.error('Error expiring alert:', expireError)
          } else {
            console.log(`  ✓ Marked alert as expired for user ${slot.reserved_for_user_id}`)
          }
        }

        // 3. Get next user in queue (oldest active alert)
        const { data: nextAlert, error: nextError } = await supabaseAdmin
          .from('slot_alerts')
          .select('id, diner_user_id, created_at')
          .eq('slot_id', slot.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .single()

        if (nextError) {
          if (nextError.code === 'PGRST116') {
            console.log('  ℹ️  No more users in queue')
          } else {
            console.error('Error fetching next alert:', nextError)
            errors++
          }
          continue
        }

        if (!nextAlert) {
          console.log('  ℹ️  Queue is empty')
          continue
        }

        console.log(`  👤 Next user: ${nextAlert.diner_user_id}`)

        // 4. Reserve slot for next user (15 minutes)
        const reserveUntil = new Date(Date.now() + 15 * 60 * 1000)
        
        const { error: reserveError } = await supabaseAdmin
          .from('slots')
          .update({
            reserved_for_user_id: nextAlert.diner_user_id,
            reserved_until: reserveUntil.toISOString()
          })
          .eq('id', slot.id)

        if (reserveError) {
          console.error('Error reserving slot:', reserveError)
          errors++
          continue
        }

        console.log(`  ✓ Reserved until ${reserveUntil.toISOString()}`)

        // 5. Update alert status to 'notified'
        const { error: updateError } = await supabaseAdmin
          .from('slot_alerts')
          .update({ 
            status: 'notified',
            notified_at: new Date().toISOString()
          })
          .eq('id', nextAlert.id)

        if (updateError) {
          console.error('Error updating alert:', updateError)
          errors++
          continue
        }

        console.log('  ✓ Alert marked as notified')

        // 6. Get venue details for email
        const { data: venue } = await supabaseAdmin
          .from('venues')
          .select('id, name, area, image_venue')
          .eq('id', slot.venue_id)
          .single()

        if (!venue) {
          console.error('  ❌ Venue not found')
          errors++
          continue
        }

        // 7. Get user details
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
          nextAlert.diner_user_id
        )

        if (!authUser?.user?.email) {
          console.error('  ❌ User email not found')
          errors++
          continue
        }

        const fullName = authUser.user.user_metadata?.full_name || 
                        authUser.user.user_metadata?.name ||
                        'Guest'

        // 8. Send notification email
        await sendAlertNotification({
          userEmail: authUser.user.email,
          userName: fullName,
          venueName: venue.name,
          venueArea: venue.area,
          venueAddress: venue.area || 'London',
          venueImageUrl: (venue as any).image_venue,
          slotTime: formatFullDateTime(slot.start_at),
          partySize: `${slot.party_min}-${slot.party_max} guests`,
          slotId: slot.id,
          venueId: venue.id,
        })

        console.log(`  ✅ Email sent to ${authUser.user.email}`)
        processed++

      } catch (err) {
        console.error(`❌ Error processing slot ${slot.id}:`, err)
        errors++
      }
    }

    console.log(`\n🎉 FIFO worker complete: ${processed} processed, ${errors} errors`)

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: expiredSlots.length
    })

  } catch (error: any) {
    console.error('❌ FIFO worker error:', error)
    return NextResponse.json(
      { error: error.message || 'Worker failed' },
      { status: 500 }
    )
  }
}

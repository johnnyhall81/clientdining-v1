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

function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('⚠️  CRON_SECRET not set - endpoint is unprotected!')
    return true
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Starting FIFO queue worker...')
    
    const { data: expiredSlots, error: slotsError } = await supabaseAdmin
      .from('slots')
      .select('id, venue_id, start_at, party_min, party_max, reserved_for_user_id')
      .eq('status', 'available')
      .not('reserved_until', 'is', null)
      .lt('reserved_until', new Date().toISOString())

    if (slotsError) throw slotsError

    if (!expiredSlots || expiredSlots.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No expired reservations',
        processed: 0
      })
    }

    let processed = 0
    let errors = 0

    for (const slot of expiredSlots) {
      try {
        const { error: clearError } = await supabaseAdmin
          .from('slots')
          .update({ reserved_for_user_id: null, reserved_until: null })
          .eq('id', slot.id)

        if (clearError) { errors++; continue }

        if (slot.reserved_for_user_id) {
          await supabaseAdmin
            .from('slot_alerts')
            .update({ status: 'expired' })
            .eq('slot_id', slot.id)
            .eq('diner_user_id', slot.reserved_for_user_id)
            .eq('status', 'notified')
        }

        const { data: nextAlert, error: nextError } = await supabaseAdmin
          .from('slot_alerts')
          .select('id, diner_user_id, created_at')
          .eq('slot_id', slot.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)
          .single()

        if (nextError) {
          if (nextError.code !== 'PGRST116') errors++
          continue
        }

        if (!nextAlert) continue

        const reserveUntil = new Date(Date.now() + 15 * 60 * 1000)
        
        const { error: reserveError } = await supabaseAdmin
          .from('slots')
          .update({
            reserved_for_user_id: nextAlert.diner_user_id,
            reserved_until: reserveUntil.toISOString()
          })
          .eq('id', slot.id)

        if (reserveError) { errors++; continue }

        const { error: updateError } = await supabaseAdmin
          .from('slot_alerts')
          .update({ status: 'notified', notified_at: new Date().toISOString() })
          .eq('id', nextAlert.id)

        if (updateError) { errors++; continue }

        const { data: venue } = await supabaseAdmin
          .from('venues')
          .select('id, name, area, image_hero')
          .eq('id', slot.venue_id)
          .single()

        if (!venue) { errors++; continue }

        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
          nextAlert.diner_user_id
        )

        if (!authUser?.user?.email) { errors++; continue }

        const fullName = authUser.user.user_metadata?.full_name || 
                        authUser.user.user_metadata?.name ||
                        'Guest'

        await sendAlertNotification({
          userEmail: authUser.user.email,
          userName: fullName,
          venueName: venue.name,
          venueArea: venue.area,
          venueAddress: venue.area || 'London',
          venueImageUrl: (venue as any).image_hero,
          slotTime: formatFullDateTime(slot.start_at),
          partySize: `${slot.party_min}-${slot.party_max} guests`,
          slotId: slot.id,
          venueId: venue.id,
        })

        processed++

      } catch (err) {
        console.error(`❌ Error processing slot ${slot.id}:`, err)
        errors++
      }
    }

    return NextResponse.json({ success: true, processed, errors, total: expiredSlots.length })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Worker failed' }, { status: 500 })
  }
}
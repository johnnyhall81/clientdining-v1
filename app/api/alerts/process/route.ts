import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAlertNotification } from '@/lib/email/send-alert-notification'
import { formatFullDateTime } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
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
    console.log('Starting alert email processing...')
    
    // Get all notified alerts that haven't been emailed yet
    const { data: alerts, error } = await supabase
      .from('slot_alerts')
      .select(`
        id, 
        slot_id, 
        diner_user_id,
        slots!inner(
          venue_id,
          start_at,
          party_min,
          party_max
        )
      `)
      .eq('status', 'notified')
      .is('notified_at', null)

    console.log('Alerts found:', alerts?.length || 0)
    
    if (error) {
      console.error('Query error:', error)
      throw error
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No alerts to process',
        processed: 0
      })
    }

    // Process each alert
    let processed = 0
    let failed = 0

    for (const alert of alerts) {
      try {
        // Get slot details (already in joined data)
        const slot = alert.slots as any

        // Get venue details
        const { data: venue } = await supabase
          .from('venues')
          .select('id, name, area, venue_type, description')
          .eq('id', slot.venue_id)
          .single()

        if (!venue) {
          console.error(`Venue not found for slot ${alert.slot_id}`)
          failed++
          continue
        }

        // Get user details from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(
          alert.diner_user_id
        )

        if (!authUser?.user?.email) {
          console.error(`User email not found for ${alert.diner_user_id}`)
          failed++
          continue
        }

        const fullName = authUser.user.user_metadata?.full_name || 
                        authUser.user.user_metadata?.name ||
                        'Guest'

        console.log(`Sending email to: ${authUser.user.email}`)

        // Send email
        await sendAlertNotification({
          userEmail: authUser.user.email,
          userName: fullName,
          venueName: venue.name,
          venueAddress: venue.area || 'London',
          slotTime: formatFullDateTime(slot.start_at),
          partySize: `${slot.party_min}-${slot.party_max} guests`,
          slotId: alert.slot_id,
          venueId: venue.id,
        })

        // Mark as emailed
        await supabase
          .from('slot_alerts')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', alert.id)

        processed++
        console.log(`✅ Processed alert: ${alert.id}`)
        
      } catch (err) {
        console.error(`❌ Error processing alert ${alert.id}:`, err)
        failed++
      }
    }

    console.log(`\n📊 Summary: ${processed} processed, ${failed} failed`)

    return NextResponse.json({ 
      success: true,
      message: `Processed ${processed} alerts`,
      processed,
      failed,
      total: alerts.length
    })
    
  } catch (error: any) {
    console.error('❌ Alert processing error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

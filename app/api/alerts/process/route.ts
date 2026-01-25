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

export async function GET(request: Request) {
  try {
    console.log('Starting alert processing...')
    
    // Get all notified alerts that haven't been emailed yet
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('id, slot_id, user_id, venue_id')
      .eq('status', 'notified')
      .is('notified_at', null)

    console.log('Alerts found:', alerts?.length || 0)
    
    if (error) {
      console.error('Query error:', error)
      throw error
    }

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ message: 'No alerts to process' })
    }

    // Process each alert
    let processed = 0
    for (const alert of alerts) {
      try {
        // Get slot details
        const { data: slot } = await supabase
          .from('slots')
          .select('start_at, party_min, party_max')
          .eq('id', alert.slot_id)
          .single()

        // Get venue details
        const { data: venue } = await supabase
          .from('venues')
          .select('id, name, address')
          .eq('id', alert.venue_id)
          .single()

        // Get user details
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', alert.user_id)
          .single()

        if (!slot || !venue || !profile) {
          console.error('Missing data for alert:', alert.id)
          continue
        }

        console.log('Sending email to:', profile.email)

        // Send email
        await sendAlertNotification({
          userEmail: profile.email,
          userName: profile.full_name || 'Guest',
          venueName: venue.name,
          venueAddress: venue.address || 'London',
          slotTime: formatFullDateTime(slot.start_at),
          partySize: `${slot.party_min}-${slot.party_max} guests`,
          slotId: alert.slot_id,
          venueId: venue.id,
        })

        // Mark as emailed
        await supabase
          .from('alerts')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', alert.id)

        processed++
        console.log('Processed alert:', alert.id)
      } catch (err) {
        console.error('Error processing alert:', alert.id, err)
      }
    }

    return NextResponse.json({ 
      message: `Processed ${processed} alerts`,
      count: processed 
    })
  } catch (error: any) {
    console.error('Alert processing error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

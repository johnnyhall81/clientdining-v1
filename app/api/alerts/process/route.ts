import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAlertNotification } from '@/lib/email/send-alert-notification'
import { formatFullDateTime } from '@/lib/date-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Get all notified alerts that haven't been emailed yet
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select(`
        id,
        slot_id,
        user_id,
        notified_at,
        slots!inner (
          id,
          start_at,
          party_min,
          party_max,
          venue_id
        ),
        venues!inner (
          id,
          name,
          address
        ),
        profiles!inner (
          email,
          full_name
        )
      `)
      .eq('status', 'notified')
      .is('notified_at', null)

    if (error) throw error

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ message: 'No alerts to process' })
    }

    // Send emails for each alert
    for (const alert of alerts) {
      const slot = (alert as any).slots
      const venue = (alert as any).venues
      const profile = (alert as any).profiles

      await sendAlertNotification({
        userEmail: profile.email,
        userName: profile.full_name || 'Guest',
        venueName: venue.name,
        venueAddress: venue.address,
        slotTime: formatFullDateTime(slot.start_at),
        partySize: `${slot.party_min}-${slot.party_max} guests`,
        slotId: slot.id,
        venueId: venue.id,
      })

      // Mark as emailed
      await supabase
        .from('alerts')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', alert.id)
    }

    return NextResponse.json({ 
      message: `Processed ${alerts.length} alerts`,
      count: alerts.length 
    })
  } catch (error: any) {
    console.error('Alert processing error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

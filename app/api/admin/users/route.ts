import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch stats for all users
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const now = new Date().toISOString()

        // Count past bookings
        const { count: pastBookings } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.user_id)
          .eq('status', 'active')
          .lt('slots.start_at', now)

        // Count future bookings
        const { count: futureBookings } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.user_id)
          .eq('status', 'active')
          .gte('slots.start_at', now)

        // Count active alerts
        const { count: alerts } = await supabaseAdmin
          .from('slot_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('diner_user_id', user.user_id)
          .in('status', ['active', 'notified'])

        // Count cancellations
        const { count: cancellations } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.user_id)
          .eq('status', 'cancelled')

        return {
          ...user,
          stats: {
            pastBookings: pastBookings || 0,
            futureBookings: futureBookings || 0,
            alerts: alerts || 0,
            cancellations: cancellations || 0,
          }
        }
      })
    )

    const response = NextResponse.json({ users: usersWithStats })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
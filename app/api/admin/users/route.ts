import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const now = new Date().toISOString()

        const { data: bookings } = await supabaseAdmin
          .from('bookings')
          .select('*, slots(start_at)')
          .eq('user_id', user.user_id)
          .eq('status', 'active')

        const pastBookings = (bookings || []).filter(b => b.slots?.start_at < now).length
        const futureBookings = (bookings || []).filter(b => b.slots?.start_at >= now).length

        const { data: alertsData } = await supabaseAdmin
          .from('slot_alerts')
          .select('id')
          .eq('diner_user_id', user.user_id)
          .in('status', ['active', 'notified'])

        const { data: cancellationsData } = await supabaseAdmin
          .from('bookings')
          .select('id')
          .eq('user_id', user.user_id)
          .eq('status', 'cancelled')

        return {
          ...user,
          stats: {
            pastBookings,
            futureBookings,
            alerts: alertsData?.length || 0,
            cancellations: cancellationsData?.length || 0,
          }
        }
      })
    )

    return NextResponse.json(
      { users: usersWithStats },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )

  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

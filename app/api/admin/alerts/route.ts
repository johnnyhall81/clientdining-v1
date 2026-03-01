export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const filterStatus = searchParams.get('status') || 'active'

    let query = supabaseAdmin
      .from('slot_alerts')
      .select(`
        id,
        slot_id,
        diner_user_id,
        status,
        created_at,
        slots!inner (
          id,
          start_at,
          party_min,
          party_max,
          slot_tier,
          status,
          venue_id,
          venues!inner (
            id,
            name,
            area
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query

    if (error) throw error

    const dinerUserIds = Array.from(
      new Set((data || []).map(item => item.diner_user_id))
    )

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, full_name')
      .in('user_id', dinerUserIds)

    const profileMap = new Map()
    profiles?.forEach((profile: any) => {
      profileMap.set(profile.user_id, profile)
    })

    const transformedAlerts = (data || []).map((item: any) => {
      const dinerProfile = profileMap.get(item.diner_user_id) || {
        user_id: item.diner_user_id,
        email: 'Unknown',
        full_name: null,
      }

      return {
        id: item.id,
        slot_id: item.slot_id,
        diner_user_id: item.diner_user_id,
        status: item.status,
        created_at: item.created_at,
        slot: item.slots,
        venue: item.slots.venues,
        diner: dinerProfile,
      }
    })

    return NextResponse.json(
      { alerts: transformedAlerts },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )

  } catch (error: any) {
    console.error('Admin alerts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load alerts' },
      { status: 500 }
    )
  }
}

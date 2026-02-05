export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service role client - bypasses RLS to see ALL data
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
  try {
    // Get the status filter from URL (e.g., ?status=active)
    const { searchParams } = new URL(request.url)
    const filterStatus = searchParams.get('status') || 'active'

    console.log('🔍 Admin loading alerts with status:', filterStatus)

    // Query ALL alerts (not filtered by user)
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

    // Apply status filter if not "all"
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error loading alerts:', error)
      throw error
    }

    console.log('✅ Loaded', data?.length || 0, 'alerts')

    // Get all unique diner user IDs from the alerts
    const dinerUserIds = Array.from(
      new Set((data || []).map(item => item.diner_user_id))
    )

    console.log('👥 Loading profiles for', dinerUserIds.length, 'users')

    // Fetch all the diner profiles (emails, names)
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email, full_name')
      .in('user_id', dinerUserIds)

    // Create a map for quick lookup
    const profileMap = new Map()
    profiles?.forEach((profile: any) => {
      profileMap.set(profile.user_id, profile)
    })

    // Transform the data to match what the frontend expects
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

    console.log('📤 Returning', transformedAlerts.length, 'transformed alerts')

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
    console.error('💥 Admin alerts API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load alerts' }, 
      { status: 500 }
    )
  }
}

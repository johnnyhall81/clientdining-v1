import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Load active bookings
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        slots!inner (
          start_at,
          venues!inner (name, phone, booking_email)
        ),
        profiles!bookings_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    const activeWithUsers = (activeBookings || []).map((booking: any) => ({
      ...booking,
      slot: {
        start_at: booking.slots.start_at,
        venue: booking.slots.venues
      },
      user: {
        email: booking.profiles?.email || 'N/A',
        full_name: booking.profiles?.full_name || null
      }
    }))

    // Load cancelled bookings
    const { data: cancelledBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        slots!inner (
          start_at,
          venues!inner (name, phone, booking_email)
        ),
        profiles!bookings_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('status', 'cancelled')
      .order('cancelled_at', { ascending: false })
      .limit(50)

    const cancelledWithUsers = (cancelledBookings || []).map((booking: any) => ({
      ...booking,
      slot: {
        start_at: booking.slots.start_at,
        venue: booking.slots.venues
      },
      user: {
        email: booking.profiles?.email || 'N/A',
        full_name: booking.profiles?.full_name || null
      }
    }))

    // Load completed bookings
    const { data: completedBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        slots!inner (
          start_at,
          venues!inner (name, phone, booking_email)
        ),
        profiles!bookings_user_id_fkey (
          full_name,
          email
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    const completedWithUsers = (completedBookings || []).map((booking: any) => ({
      ...booking,
      slot: {
        start_at: booking.slots.start_at,
        venue: booking.slots.venues
      },
      user: {
        email: booking.profiles?.email || 'N/A',
        full_name: booking.profiles?.full_name || null
      }
    }))

    // Load active alerts (using same pattern as working alerts endpoint)
const { data: alertsRaw } = await supabase
.from('slot_alerts')
.select(`
  id,
  slot_id,
  diner_user_id,
  status,
  created_at,
  notified_at,
  slots!inner (
    id,
    start_at,
    venues!inner (
      id,
      name
    )
  )
`)
.in('status', ['active', 'notified'])
.order('created_at', { ascending: false })
.limit(100)

// Get diner profiles (same pattern as working alerts endpoint)
const dinerUserIds = Array.from(
new Set((alertsRaw || []).map(item => item.diner_user_id))
)

const { data: alertProfiles } = await supabase
.from('profiles')
.select('user_id, email, full_name')
.in('user_id', dinerUserIds)

const alertProfileMap = new Map()
alertProfiles?.forEach((profile: any) => {
alertProfileMap.set(profile.user_id, profile)
})

const alertsWithUsers = (alertsRaw || []).map((alert: any) => ({
...alert,
slot: {
  start_at: alert.slots.start_at,
  venue: {
    name: alert.slots.venues.name
  }
},
user: alertProfileMap.get(alert.diner_user_id) || {
  email: 'N/A',
  full_name: null
}
}))

    // Load new users (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, role, diner_tier, is_professionally_verified, created_at, referred_by_user_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    const usersWithEmail = await Promise.all((profilesData || []).map(async (profile: any) => {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id)
      return {
        ...profile,
        email: userData?.user?.email || 'N/A',
        full_name: userData?.user?.user_metadata?.full_name || null
      }
    }))

    // Load referrals
    const { data: referralProfiles } = await supabase
      .from('profiles')
      .select('user_id, diner_tier, created_at, referred_by_user_id')
      .not('referred_by_user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100)

    const referralsWithEmails = await Promise.all((referralProfiles || []).map(async (profile: any) => {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id)
      const { data: referrerData } = await supabase.auth.admin.getUserById(profile.referred_by_user_id)
      return {
        user_id: profile.user_id,
        email: userData?.user?.email || 'N/A',
        full_name: userData?.user?.user_metadata?.full_name || null,
        created_at: profile.created_at,
        diner_tier: profile.diner_tier,
        referrer: {
          email: referrerData?.user?.email || 'N/A',
          full_name: referrerData?.user?.user_metadata?.full_name || null
        }
      }
    }))

    return NextResponse.json({
      activeBookings: activeWithUsers,
      cancelledBookings: cancelledWithUsers,
      completedBookings: completedWithUsers,
      alerts: alertsWithUsers,
      newUsers: usersWithEmail,
      referrals: referralsWithEmails,
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
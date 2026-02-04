import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create admin client with service role
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
    const { data: activeRaw } = await supabase
      .from('bookings')
      .select(`
        id,
        slot_id,
        diner_user_id,
        party_size,
        status,
        notes_private,
        created_at,
        cancelled_at,
        slot:slots!inner(
          start_at,
          venue:venues!inner(name, phone, booking_email)
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    const activeWithUsers = await Promise.all((activeRaw || []).map(async (booking: any) => {
      const { data: userData } = await supabase.auth.admin.getUserById(booking.diner_user_id)
      return {
        ...booking,
        user_id: booking.diner_user_id,
        user: {
          email: userData?.user?.email || 'N/A',
          full_name: userData?.user?.user_metadata?.full_name || null
        }
      }
    }))

    // Load cancelled bookings
    const { data: cancelledRaw } = await supabase
      .from('bookings')
      .select(`
        id,
        slot_id,
        diner_user_id,
        party_size,
        status,
        notes_private,
        created_at,
        cancelled_at,
        slot:slots!inner(
          start_at,
          venue:venues!inner(name, phone, booking_email)
        )
      `)
      .eq('status', 'cancelled')
      .order('cancelled_at', { ascending: false })
      .limit(50)

    const cancelledWithUsers = await Promise.all((cancelledRaw || []).map(async (booking: any) => {
      const { data: userData } = await supabase.auth.admin.getUserById(booking.diner_user_id)
      return {
        ...booking,
        user_id: booking.diner_user_id,
        user: {
          email: userData?.user?.email || 'N/A',
          full_name: userData?.user?.user_metadata?.full_name || null
        }
      }
    }))

    // Load completed bookings
    const { data: completedRaw } = await supabase
      .from('bookings')
      .select(`
        id,
        slot_id,
        diner_user_id,
        party_size,
        status,
        notes_private,
        created_at,
        cancelled_at,
        slot:slots!inner(
          start_at,
          venue:venues!inner(name, phone, booking_email)
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    const completedWithUsers = await Promise.all((completedRaw || []).map(async (booking: any) => {
      const { data: userData } = await supabase.auth.admin.getUserById(booking.diner_user_id)
      return {
        ...booking,
        user_id: booking.diner_user_id,
        user: {
          email: userData?.user?.email || 'N/A',
          full_name: userData?.user?.user_metadata?.full_name || null
        }
      }
    }))

    // Load active alerts
    const { data: alertsRaw } = await supabase
      .from('slot_alerts')
      .select(`
        id,
        slot_id,
        diner_user_id,
        status,
        created_at,
        notified_at,
        slot:slots!inner(
          start_at,
          venue:venues!inner(name)
        )
      `)
      .in('status', ['active', 'notified'])
      .order('created_at', { ascending: false })
      .limit(100)

    const alertsWithUsers = await Promise.all((alertsRaw || []).map(async (alert: any) => {
      const { data: userData } = await supabase.auth.admin.getUserById(alert.diner_user_id)
      return {
        ...alert,
        user: {
          email: userData?.user?.email || 'N/A',
          full_name: userData?.user?.user_metadata?.full_name || null
        }
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
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        slots!inner (
          start_at,
          party_min,
          party_max,
          venues!inner (
            name,
            area
          )
        ),
        profiles!inner (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

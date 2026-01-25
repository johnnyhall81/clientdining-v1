import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { slotId } = await request.json()
    
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get slot info
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('venue_id, status')
      .eq('id', slotId)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    // Check if alert already exists
    const { data: existingAlert } = await supabase
      .from('alerts')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('slot_id', slotId)
      .single()

    if (existingAlert) {
      // Toggle off - delete the alert
      const { error: deleteError } = await supabase
        .from('alerts')
        .delete()
        .eq('id', existingAlert.id)

      if (deleteError) throw deleteError

      return NextResponse.json({ active: false })
    } else {
      // Toggle on - create the alert
      const { error: insertError } = await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          slot_id: slotId,
          venue_id: slot.venue_id,
          status: 'active',
        })

      if (insertError) throw insertError

      return NextResponse.json({ active: true })
    }
  } catch (error: any) {
    console.error('Alert toggle error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle alert' },
      { status: 500 }
    )
  }
}

// Get user's alerts
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select(`
        id,
        slot_id,
        status,
        created_at,
        notified_at,
        expires_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error: any) {
    console.error('Fetch alerts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

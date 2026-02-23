import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { private_notes } = await request.json()
    console.log('📝 Notes PATCH called, booking id:', params.id)
    console.log('📝 private_notes value:', private_notes)

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
    console.log('📝 Auth user:', user?.id, 'authError:', authError?.message)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ private_notes: private_notes || null })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()

    console.log('📝 Update result data:', data)
    console.log('📝 Update result error:', error?.message)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      console.log('📝 No rows updated — booking id or user_id mismatch')
      return NextResponse.json({ error: 'No matching booking found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.log('📝 Catch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

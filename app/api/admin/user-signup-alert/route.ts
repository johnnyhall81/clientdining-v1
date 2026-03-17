import { NextRequest, NextResponse } from 'next/server'
import { sendAdminUserAlert } from '@/lib/email/send-admin-user-alert'
import { createClient } from '@supabase/supabase-js'

// Called by Supabase Database Webhook on INSERT to public.profiles
// Webhook secret should be set in Supabase and matched here
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('x-webhook-secret')
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Supabase webhook payload: { type: 'INSERT', table: 'profiles', record: {...} }
    const { type, record } = body
    if (type !== 'INSERT' || !record?.user_id) {
      return NextResponse.json({ ok: true }) // ignore non-insert events
    }

    const userId = record.user_id

    // Fetch user details from auth.users via service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)
    if (error || !user) {
      console.error('Could not fetch user for signup alert:', error)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const fullName = user.user_metadata?.full_name || user.user_metadata?.name
    const email = user.email || '—'

    await sendAdminUserAlert({ userId, email, fullName })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('User signup alert error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

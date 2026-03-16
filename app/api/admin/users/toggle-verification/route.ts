export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/admin-guard'
import { sendVerificationConfirmation } from '@/lib/email/send-verification-confirmation'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const { userId, verified } = await request.json()

    // Fetch profile first so we have email + name for the notification
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, is_professionally_verified')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update verification status
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_professionally_verified: verified,
        verified_at: verified ? new Date().toISOString() : null,
      })
      .eq('user_id', userId)

    if (error) throw error

    // Send welcome email only when newly verifying (not when un-verifying)
    if (verified && !profile.is_professionally_verified) {
      await sendVerificationConfirmation({
        userEmail: profile.email,
        userName: profile.full_name || '',
      }).catch((err) => console.error('Verification email failed:', err))
    }

    return NextResponse.json({ success: true, emailSent: verified && !profile.is_professionally_verified })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

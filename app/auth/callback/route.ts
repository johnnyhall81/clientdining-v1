import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAdminUserAlert } from '@/lib/email/send-admin-user-alert'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Check if this is a new signup (profile created in last 30s)
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        const ageSeconds = (Date.now() - new Date(profile.created_at).getTime()) / 1000
        if (ageSeconds < 30) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name
          await sendAdminUserAlert({
            userId: user.id,
            email: user.email || '—',
            fullName,
          }).catch(err => console.error('User alert email failed:', err))
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}

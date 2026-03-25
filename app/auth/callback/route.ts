import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { sendAdminUserAlert } from '@/lib/email/send-admin-user-alert'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (!code) {
    return NextResponse.redirect(`${origin}/home`)
  }

  // Build response first so we can attach cookies to it
  const response = NextResponse.redirect(`${origin}${next}`)

  // SSR client writes session into cookies the browser can read immediately
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (!error && user) {
    // Service role only for the admin new-signup check — does not affect session
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: profile } = await adminClient
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

  return response
}

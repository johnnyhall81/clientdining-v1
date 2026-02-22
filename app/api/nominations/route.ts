import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const { name, email, company } = await request.json()

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

    // Get nominator details and check if they can nominate
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, can_nominate')
      .eq('user_id', user.id)
      .single()

    if (!profile?.can_nominate) {
      return NextResponse.json(
        { error: 'Nomination capability not enabled for your account' },
        { status: 403 }
      )
    }

    // Create nomination
    const { data: nomination, error: insertError } = await supabase
      .from('nominations')
      .insert({
        nominator_user_id: user.id,
        nominee_name: name,
        nominee_email: email,
        nominee_company: company || null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Send invitation email
    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: email,
      subject: `${profile?.full_name?.split(' ')[0] || 'A colleague'} has invited you to ClientDining`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; }
              .container { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
              .button { display: inline-block; background: #111827; color: white; padding: 14px 32px; text-decoration: none; font-size: 14px; font-weight: 400; margin: 32px 0; }
              .footer { color: #9CA3AF; font-size: 13px; margin-top: 48px; border-top: 1px solid #F3F4F6; padding-top: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <p style="font-size: 20px; font-weight: 300; margin-bottom: 24px;">${profile?.full_name?.split(' ')[0] || 'A colleague'} has invited you.</p>

              <p style="color: #374151; font-weight: 300;">ClientDining is private access to London's best restaurants and members' clubs. Built for professionals who take business dining seriously.</p>

              <a href="https://clientdining.com/signup?ref=${user.id}" class="button">Accept invitation</a>

              <div class="footer">
                <p>ClientDining · London</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    return NextResponse.json({ success: true, nomination })
  } catch (error: any) {
    console.error('Nomination error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create nomination' },
      { status: 500 }
    )
  }
}

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

    // Check if user can nominate
    const { data: profile } = await supabase
      .from('profiles')
      .select('can_nominate')
      .eq('user_id', user.id)
      .single()

    const { data: nominations, error } = await supabase
      .from('nominations')
      .select('*')
      .eq('nominator_user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      nominations,
      can_nominate: profile?.can_nominate || false
    })
  } catch (error: any) {
    console.error('Fetch nominations error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch nominations' },
      { status: 500 }
    )
  }
}
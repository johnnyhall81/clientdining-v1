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

    // Check nomination count
    const { count } = await supabase
      .from('nominations')
      .select('*', { count: 'exact', head: true })
      .eq('nominator_user_id', user.id)

    if (count && count >= 3) {
      return NextResponse.json(
        { error: 'You have already used all 3 nominations' },
        { status: 400 }
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
      subject: `${profile?.full_name || 'A colleague'} has invited you to ClientDining`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { margin-bottom: 32px; }
              .content { background: #F9FAFB; padding: 32px; border-radius: 8px; margin: 24px 0; }
              .button { display: inline-block; background: #111827; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0; }
              .footer { color: #6B7280; font-size: 14px; margin-top: 32px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;">You're Invited to ClientDining</h1>
              </div>

              <p>Hello ${name},</p>

              <p><strong>${profile?.full_name || 'A colleague'}</strong> has invited you to join ClientDining — access to London's most sought-after tables.</p>

              <div class="content">
                <p style="margin: 0; color: #374151;">Members' clubs, Michelin restaurants, and private rooms. The tables that matter, when they matter.</p>
              </div>

              <a href="https://clientdining.com/signup?ref=${user.id}" class="button">Accept Invitation</a>

              <div class="footer">
                <p>ClientDining · London's best tables</p>
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
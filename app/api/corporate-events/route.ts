import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
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

    const body = await request.json()
    const {
      venueId,
      venueName,
      firstName,
      lastName,
      email,
      phone,
      phoneExt,
      company,
      eventType,
      eventNature,
      eventDate,
      startTime,
      endTime,
      numberOfPeople,
      additionalInfo,
      hearAboutUs,
    } = body

    const { data: eventRequest, error: insertError } = await supabase
      .from('corporate_event_requests')
      .insert({
        user_id: user.id,
        venue_id: venueId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        phone_ext: phoneExt,
        company: company ?? '',
        event_type: eventType,
        event_nature: eventNature,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        number_of_people: parseInt(numberOfPeople),
        additional_info: additionalInfo,
        hear_about_us: hearAboutUs,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: 'john@clientdining.com',
      subject: `New Corporate Event Request - ${venueName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
              .section { margin: 16px 0; }
              .label { font-weight: 600; color: #374151; }
              .value { color: #6B7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">New Corporate Event Request</h2>
                <p style="margin: 8px 0 0 0; color: #6B7280;">${venueName}</p>
              </div>

              <div class="section">
                <p class="label">Contact</p>
                <p class="value">${firstName} ${lastName}</p>
                <p class="value">${email}</p>
                ${phone ? `<p class="value">${phone}${phoneExt ? ` ext. ${phoneExt}` : ''}</p>` : ''}
                <p class="value">${company}</p>
              </div>

              <div class="section">
                <p class="label">Event Details</p>
                <p class="value"><strong>Type:</strong> ${eventType}</p>
                <p class="value"><strong>Nature:</strong> ${eventNature}</p>
                <p class="value"><strong>Date:</strong> ${eventDate}</p>
                <p class="value"><strong>Time:</strong> ${startTime} - ${endTime}</p>
                <p class="value"><strong>Guests:</strong> ${numberOfPeople}</p>
              </div>

              ${additionalInfo ? `
                <div class="section">
                  <p class="label">Additional Information</p>
                  <p class="value">${additionalInfo}</p>
                </div>
              ` : ''}

              <div class="section" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 14px; color: #6B7280;">
                  View and manage this request in the <a href="https://clientdining.com/admin/corporate-events" style="color: #111827;">admin dashboard</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    return NextResponse.json({ success: true, eventRequest })
  } catch (error: any) {
    console.error('Corporate event request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit request' },
      { status: 500 }
    )
  }
}
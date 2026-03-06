import { Resend } from 'resend'
import { generateIcs } from '../calendar/generate-ics'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface BookingEmailData {
  userEmail: string
  userName: string
  venueName: string
  venueArea?: string
  venueAddress: string
  venuePostcode: string
  venuePhone?: string
  venueEmail?: string
  venueImageUrl?: string
  slotTime: string
  slotStartISO: string
  partySize: number
  bookingId: string
  guestNames?: string[]
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const icsContent = generateIcs({
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      startTime: data.slotStartISO,
      partySize: data.partySize,
      bookingId: data.bookingId
    })

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${data.venueName}, ${data.venueAddress}, ${data.venuePostcode}`
    )}`

    const ref = data.bookingId.slice(0, 8).toUpperCase()

    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Booking confirmed — ${data.venueName}`,
      attachments: icsContent ? [{
        filename: `booking-${data.bookingId.slice(0, 8)}.ics`,
        content: Buffer.from(icsContent).toString('base64')
      }] : [],
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking confirmed — ${data.venueName}</title>
          </head>
          <body style="margin:0;padding:0;background-color:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:32px 16px;">
              <tr>
                <td align="center">

                  <!-- Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">

                    <!-- Hero image -->
                    ${data.venueImageUrl ? `
                    <tr>
                      <td style="padding:0;line-height:0;font-size:0;">
                        <img src="${data.venueImageUrl}" alt="${data.venueName}" width="600" height="240" style="width:100%;max-width:600px;height:240px;object-fit:cover;display:block;border:0;outline:none;text-decoration:none;" />
                      </td>
                    </tr>
                    ` : `
                    <tr>
                      <td style="padding:0;background-color:#E4E4E7;height:8px;line-height:8px;">&nbsp;</td>
                    </tr>
                    `}

                    <!-- Content -->
                    <tr>
                      <td style="padding:36px 40px 40px;">

                        <!-- Venue name + area + address -->
                        <p style="margin:0 0 4px 0;font-size:24px;font-weight:300;color:#18181B;letter-spacing:-0.3px;">${data.venueName}</p>
                        ${data.venueArea ? `<p style="margin:0 0 6px 0;font-size:13px;font-weight:300;color:#A1A1AA;">${data.venueArea}</p>` : ''}
                        <a href="${mapsUrl}" target="_blank" style="display:inline-block;margin:0 0 28px 0;font-size:13px;font-weight:300;color:#71717A;text-decoration:underline;text-underline-offset:2px;">${data.venueAddress}${data.venuePostcode ? `, ${data.venuePostcode}` : ''}</a>

                        <!-- Confirmed label -->
                        <p style="margin:0 0 24px 0;font-size:13px;font-weight:300;color:#16A34A;letter-spacing:0.05em;text-transform:uppercase;">Confirmed</p>

                        <!-- Detail rows -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F4F4F5;">

                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;width:140px;vertical-align:top;">Date &amp; Time</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.slotTime}</td>
                          </tr>

                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Party Size</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</td>
                          </tr>

                          ${data.venuePhone ? `
                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Phone</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.venuePhone}</td>
                          </tr>
                          ` : ''}

                          ${data.venueEmail ? `
                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Email</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.venueEmail}</td>
                          </tr>
                          ` : ''}

                          <tr>
                            <td style="padding:14px 0;${data.guestNames?.length ? 'border-bottom:1px solid #F4F4F5;' : ''}font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">ClientDining Reference</td>
                            <td style="padding:14px 0;${data.guestNames?.length ? 'border-bottom:1px solid #F4F4F5;' : ''}font-size:14px;font-weight:300;color:#18181B;text-align:right;letter-spacing:0.05em;">${ref}</td>
                          </tr>

                          ${data.guestNames?.length ? `
                          <tr>
                            <td style="padding:14px 0;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Guests</td>
                            <td style="padding:14px 0;font-size:14px;font-weight:300;color:#18181B;text-align:right;line-height:1.8;">
                              ${data.guestNames.join('<br/>')}
                            </td>
                          </tr>
                          ` : ''}

                        </table>

                        ${icsContent ? `
                        <!-- Calendar note -->
                        <p style="margin:24px 0 0 0;font-size:13px;font-weight:300;color:#71717A;">
                          📅 Calendar event attached — open the .ics file to add this to your calendar.
                        </p>
                        ` : ''}

                        <!-- CTAs -->
                        <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                          <tr>
                            <td style="padding-right:12px;">
                              <a href="${mapsUrl}" style="display:inline-block;padding:11px 24px;background-color:#F4F4F5;color:#3F3F46;text-decoration:none;font-size:13px;font-weight:300;border-radius:8px;" target="_blank">Get directions</a>
                            </td>
                            <td>
                              <a href="https://clientdining.com/bookings" style="display:inline-block;padding:11px 24px;background-color:#F4F4F5;color:#3F3F46;text-decoration:none;font-size:13px;font-weight:300;border-radius:8px;">View bookings</a>
                            </td>
                          </tr>
                        </table>

                        <!-- Policy note -->
                        <p style="margin:28px 0 0 0;font-size:12px;font-weight:300;color:#A1A1AA;line-height:1.6;">
                          To make changes, contact the venue directly and quote your ClientDining reference. To change the date or time, cancel and rebook from your bookings page.
                        </p>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px 28px;border-top:1px solid #F4F4F5;">
                        <p style="margin:0;font-size:12px;font-weight:300;color:#A1A1AA;text-align:center;">
                          <a href="https://clientdining.com" style="color:#A1A1AA;text-decoration:none;">clientdining.com</a>
                          &nbsp;·&nbsp;
                          CLIENTDINING LIMITED
                          &nbsp;·&nbsp;
                          Company No: 17018817
                        </p>
                      </td>
                    </tr>

                  </table>
                  <!-- /Card -->

                </td>
              </tr>
            </table>

          </body>
        </html>
      `
    })

    console.log('✅ Booking confirmation email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send booking confirmation:', error)
    return { success: false, error }
  }
}

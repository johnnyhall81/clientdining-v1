import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface CancellationEmailData {
  userEmail: string
  userName: string
  venueName: string
  venueArea?: string
  venueAddress: string
  venuePostcode?: string
  venueImageUrl?: string
  slotTime: string
  partySize: number
  bookingId: string
}

export async function sendCancellationConfirmation(data: CancellationEmailData) {
  try {
    const ref = data.bookingId.slice(0, 8).toUpperCase()
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${data.venueName}, ${data.venueAddress}, ${data.venuePostcode || ''}`
    )}`

    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Booking cancelled — ${data.venueName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking cancelled — ${data.venueName}</title>
          </head>
          <body style="margin:0;padding:0;background-color:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:32px 16px;">
              <tr>
                <td align="center">

                  <!-- Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">

                    <!-- Hero image (muted with overlay) -->
                    ${data.venueImageUrl ? `
                    <tr>
                      <td style="padding:0;line-height:0;position:relative;">
                        <img src="${data.venueImageUrl}" alt="${data.venueName}" width="600" style="width:100%;height:200px;object-fit:cover;display:block;opacity:0.5;filter:grayscale(30%);" />
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

                        <!-- Venue name + address -->
                        <p style="margin:0 0 8px 0;font-size:24px;font-weight:300;color:#18181B;letter-spacing:-0.3px;">${data.venueName}</p>
                        <a href="${mapsUrl}" target="_blank" style="display:inline-block;margin:0 0 28px 0;font-size:13px;font-weight:300;color:#71717A;text-decoration:none;">&#x1F4CD; ${data.venueAddress}${data.venuePostcode ? `, ${data.venuePostcode}` : ''}</a>

                        <!-- Cancelled label -->
                        <p style="margin:0 0 24px 0;font-size:13px;font-weight:300;color:#71717A;letter-spacing:0.02em;">Your booking has been cancelled</p>

                        <!-- Detail rows -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F4F4F5;">

                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;width:140px;vertical-align:top;">Date &amp; Time</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#71717A;text-align:right;">${data.slotTime}</td>
                          </tr>

                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Party Size</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#71717A;text-align:right;">${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</td>
                          </tr>

                          <tr>
                            <td style="padding:14px 0;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Reference</td>
                            <td style="padding:14px 0;font-size:14px;font-weight:300;color:#71717A;text-align:right;letter-spacing:0.05em;">${ref}</td>
                          </tr>

                        </table>

                        <!-- CTA -->
                        <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                          <tr>
                            <td>
                              <a href="https://clientdining.com/search" style="display:inline-block;padding:11px 24px;background-color:#F4F4F5;color:#3F3F46;text-decoration:none;font-size:13px;font-weight:300;border-radius:8px;">Find another table</a>
                            </td>
                          </tr>
                        </table>

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

    console.log('✅ Cancellation email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error)
    return { success: false, error }
  }
}

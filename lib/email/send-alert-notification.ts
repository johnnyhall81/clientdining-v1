import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface AlertEmailData {
  userEmail: string
  userName: string
  venueName: string
  venueArea?: string
  venueAddress: string
  venueImageUrl?: string
  slotTime: string
  partySize: string
  slotId: string
  venueId: string
}

export async function sendAlertNotification(data: AlertEmailData) {
  try {
    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Table available — ${data.venueName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Table available — ${data.venueName}</title>
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
                      <td style="padding:0;line-height:0;">
                        <img src="${data.venueImageUrl}" alt="${data.venueName}" width="600" style="width:100%;height:240px;object-fit:cover;display:block;" />
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

                        <!-- Venue name -->
                        <p style="margin:0 0 4px 0;font-size:24px;font-weight:300;color:#18181B;letter-spacing:-0.3px;">${data.venueName}</p>
                        ${data.venueArea ? `<p style="margin:0 0 28px 0;font-size:13px;font-weight:300;color:#A1A1AA;">${data.venueArea}</p>` : `<div style="margin-bottom:28px;"></div>`}

                        <!-- Available label -->
                        <p style="margin:0 0 24px 0;font-size:13px;font-weight:300;color:#16A34A;letter-spacing:0.05em;text-transform:uppercase;">Table available</p>

                        <!-- Detail rows -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F4F4F5;">

                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;width:140px;vertical-align:top;">Date &amp; Time</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.slotTime}</td>
                          </tr>

                          <tr>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Typical tables</td>
                            <td style="padding:14px 0;border-bottom:1px solid #F4F4F5;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.partySize}</td>
                          </tr>

                          <tr>
                            <td style="padding:14px 0;font-size:13px;font-weight:300;color:#A1A1AA;vertical-align:top;">Location</td>
                            <td style="padding:14px 0;font-size:14px;font-weight:300;color:#18181B;text-align:right;">${data.venueArea || data.venueAddress}</td>
                          </tr>

                        </table>

                        <!-- CTA -->
                        <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                          <tr>
                            <td>
                              <a href="https://clientdining.com/venues/${data.venueId}" style="display:inline-block;padding:11px 24px;background-color:#18181B;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:300;border-radius:8px;">View availability</a>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px 28px;border-top:1px solid #F4F4F5;">
                        <p style="margin:0 0 8px 0;font-size:12px;font-weight:300;color:#A1A1AA;text-align:center;">
                          <a href="https://clientdining.com/alerts" style="color:#A1A1AA;text-decoration:none;">Manage alerts</a>
                        </p>
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

    console.log('✅ Alert notification email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send alert email:', error)
    return { success: false, error }
  }
}

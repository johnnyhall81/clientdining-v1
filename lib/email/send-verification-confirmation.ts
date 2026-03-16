import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface VerificationEmailData {
  userEmail: string
  userName: string
}

export async function sendVerificationConfirmation(data: VerificationEmailData) {
  try {
    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: 'Your ClientDining membership is confirmed',
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your membership is confirmed</title>
          </head>
          <body style="margin:0;padding:0;background-color:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;">

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F5;padding:32px 16px;">
              <tr>
                <td align="center">

                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">

                    <!-- Top bar -->
                    <tr>
                      <td style="padding:0;background-color:#18181B;height:4px;line-height:4px;">&nbsp;</td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding:40px 40px 36px;">

                        <p style="margin:0 0 8px 0;font-size:13px;font-weight:300;color:#A1A1AA;letter-spacing:0.08em;text-transform:uppercase;">ClientDining</p>
                        <p style="margin:0 0 28px 0;font-size:26px;font-weight:300;color:#18181B;letter-spacing:-0.3px;line-height:1.2;">Your membership<br/>is confirmed.</p>

                        <p style="margin:0 0 20px 0;font-size:14px;font-weight:300;color:#52525B;line-height:1.75;">
                          ${data.userName ? `Hi ${data.userName.split(' ')[0]},` : 'Hello,'}<br/><br/>
                          Your ClientDining membership has been verified. You now have full access to book tables at our curated network of London restaurants and private members' clubs.
                        </p>

                        <p style="margin:0 0 32px 0;font-size:14px;font-weight:300;color:#52525B;line-height:1.75;">
                          Browse available tables, reserve a table for a client dinner or team evening, and enquire about private dining directly through the platform.
                        </p>

                        <!-- CTA -->
                        <table cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                          <tr>
                            <td>
                              <a href="https://clientdining.com/home" style="display:inline-block;padding:12px 28px;background-color:#18181B;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:300;letter-spacing:0.08em;text-transform:uppercase;border-radius:3px;">Browse venues</a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;font-size:13px;font-weight:300;color:#A1A1AA;line-height:1.6;">
                          When the table matters, the process should too.
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

                </td>
              </tr>
            </table>

          </body>
        </html>
      `
    })

    console.log('✅ Verification confirmation email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send verification email:', error)
    return { success: false, error }
  }
}

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface VerificationEmailData {
  userEmail: string
  userName: string
}

export async function sendVerificationConfirmation(data: VerificationEmailData) {
  try {
    const firstName = data.userName ? data.userName.split(' ')[0] : ''

    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: 'Your membership is confirmed',
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5F4F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F4F2;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:6px;overflow:hidden;border:1px solid #E8E4DF;">

      <tr><td style="background-color:#18181B;height:3px;line-height:3px;">&nbsp;</td></tr>

      <tr><td style="padding:40px 40px 36px;">

        <p style="margin:0 0 6px;font-size:11px;font-weight:300;color:#A1A1AA;letter-spacing:0.12em;text-transform:uppercase;">ClientDining</p>
        <p style="margin:0 0 28px;font-size:24px;font-weight:300;color:#18181B;letter-spacing:-0.2px;line-height:1.25;">${firstName ? `Welcome, ${firstName}.` : 'Welcome.'}<br/>Your membership is confirmed.</p>

        <p style="margin:0 0 18px;font-size:13px;font-weight:300;color:#52525B;line-height:1.75;">
          You now have full access to book at our curated network of London restaurants and private members' clubs — selected for quality, consistency and discretion.
        </p>

        <p style="margin:0 0 32px;font-size:13px;font-weight:300;color:#52525B;line-height:1.75;">
          Browse available tables, reserve for client dinners and team evenings, and enquire about private dining directly through the platform.
        </p>

        <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr><td>
            <a href="https://clientdining.com/home" style="display:inline-block;padding:10px 28px;background-color:#18181B;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:300;letter-spacing:0.12em;text-transform:uppercase;border-radius:3px;">Browse venues</a>
          </td></tr>
        </table>

        <p style="margin:0;font-size:12px;font-weight:300;color:#A1A1AA;line-height:1.6;font-style:italic;">
          When the table matters, the process should too.
        </p>

      </td></tr>

      <tr><td style="padding:18px 40px 24px;border-top:1px solid #F0EDE9;">
        <p style="margin:0;font-size:11px;font-weight:300;color:#C4C0BB;text-align:center;">
          <a href="https://clientdining.com" style="color:#C4C0BB;text-decoration:none;">clientdining.com</a>
          &nbsp;·&nbsp; CLIENTDINING LIMITED &nbsp;·&nbsp; Company No: 17018817
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`
    })

    console.log('✅ Verification email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Verification email failed:', error)
    return { success: false, error }
  }
}

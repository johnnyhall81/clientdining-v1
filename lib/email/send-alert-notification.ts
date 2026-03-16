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
      html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5F4F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F4F2;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border-radius:6px;overflow:hidden;border:1px solid #E8E4DF;">

      ${data.venueImageUrl ? `
      <tr><td style="padding:0;line-height:0;font-size:0;">
        <img src="${data.venueImageUrl}" alt="${data.venueName}" width="600" style="width:100%;height:220px;object-fit:cover;display:block;" />
      </td></tr>` : `
      <tr><td style="background-color:#18181B;height:3px;line-height:3px;">&nbsp;</td></tr>`}

      <tr><td style="padding:36px 40px 40px;">

        <p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#18181B;letter-spacing:-0.2px;">${data.venueName}</p>
        ${data.venueArea ? `<p style="margin:0 0 24px;font-size:12px;font-weight:300;color:#A1A1AA;">${data.venueArea}</p>` : '<div style="margin-bottom:24px;"></div>'}

        <p style="margin:0 0 24px;font-size:11px;font-weight:300;color:#16A34A;letter-spacing:0.12em;text-transform:uppercase;">A table has become available</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F0EDE9;">
          <tr>
            <td style="padding:13px 0;border-bottom:1px solid #F0EDE9;font-size:12px;color:#A1A1AA;width:150px;letter-spacing:0.03em;">Date &amp; Time</td>
            <td style="padding:13px 0;border-bottom:1px solid #F0EDE9;font-size:13px;color:#18181B;text-align:right;">${data.slotTime}</td>
          </tr>
          <tr>
            <td style="padding:13px 0;font-size:12px;color:#A1A1AA;letter-spacing:0.03em;">Party size</td>
            <td style="padding:13px 0;font-size:13px;color:#18181B;text-align:right;">${data.partySize}</td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
          <tr><td>
            <a href="https://clientdining.com/venues/${data.venueId}" style="display:inline-block;padding:10px 24px;background-color:#18181B;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;border-radius:3px;">View availability</a>
          </td></tr>
        </table>

        <p style="margin:20px 0 0;font-size:12px;font-weight:300;color:#A1A1AA;line-height:1.6;">
          Tables at this venue move quickly. Book now to secure your place.
        </p>

      </td></tr>

      <tr><td style="padding:18px 40px 24px;border-top:1px solid #F0EDE9;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:300;color:#C4C0BB;text-align:center;">
          <a href="https://clientdining.com/alerts" style="color:#C4C0BB;text-decoration:none;">Manage alerts</a>
        </p>
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

    console.log('✅ Alert notification sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Alert notification failed:', error)
    return { success: false, error }
  }
}

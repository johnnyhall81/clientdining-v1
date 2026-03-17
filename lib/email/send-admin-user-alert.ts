import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface AdminUserAlertData {
  userId: string
  email: string
  fullName?: string
  linkedInName?: string
}

export async function sendAdminUserAlert(data: AdminUserAlertData) {
  const ref = data.userId.slice(0, 8).toUpperCase()
  const displayName = data.fullName || data.linkedInName || '—'

  await resend.emails.send({
    from: 'ClientDining <notifications@clientdining.com>',
    to: 'john@clientdining.com',
    subject: `New member — ${displayName}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;max-width:480px;padding:32px 24px;">
        <p style="margin:0 0 2px;font-size:16px;font-weight:400;color:#18181B;">New member</p>
        <p style="margin:0 0 24px;font-size:12px;color:#A1A1AA;letter-spacing:0.05em;">${ref}</p>

        <table style="border-top:1px solid #F0EDE9;width:100%;font-size:12px;">
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#A1A1AA;width:120px;letter-spacing:0.03em;">Name</td>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#18181B;">${displayName}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#A1A1AA;letter-spacing:0.03em;">Email</td>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#18181B;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;color:#A1A1AA;letter-spacing:0.03em;">Auth</td>
            <td style="padding:11px 0;color:#18181B;">LinkedIn</td>
          </tr>
        </table>

        <a href="https://clientdining.com/admin/users" style="display:inline-block;margin-top:24px;padding:9px 20px;background:#18181B;color:#fff;text-decoration:none;font-size:11px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;border-radius:3px;">View in admin</a>
      </div>
    `
  })
}

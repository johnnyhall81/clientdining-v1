import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface AdminBookingAlertData {
  userName: string
  userEmail: string
  venueName: string
  venueArea?: string
  slotTime: string
  partySize: number
  bookingId: string
  notes?: string
  guestNames?: string[]
}

export async function sendAdminBookingAlert(data: AdminBookingAlertData) {
  const ref = data.bookingId.slice(0, 8).toUpperCase()

  await resend.emails.send({
    from: 'ClientDining <notifications@clientdining.com>',
    to: 'john@clientdining.com',
    subject: `New booking — ${data.venueName} · ${data.slotTime}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-weight:300;color:#18181B;max-width:480px;padding:32px 24px;">
        <p style="margin:0 0 2px;font-size:16px;font-weight:400;color:#18181B;">New booking</p>
        <p style="margin:0 0 24px;font-size:12px;color:#A1A1AA;letter-spacing:0.05em;">${ref}</p>

        <table style="border-top:1px solid #F0EDE9;width:100%;font-size:12px;">
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#A1A1AA;width:120px;letter-spacing:0.03em;">Venue</td>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#18181B;">${data.venueName}${data.venueArea ? ` · ${data.venueArea}` : ''}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#A1A1AA;letter-spacing:0.03em;">Date &amp; Time</td>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#18181B;">${data.slotTime}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#A1A1AA;letter-spacing:0.03em;">Member</td>
            <td style="padding:11px 0;border-bottom:1px solid #F0EDE9;color:#18181B;">${data.userName} · ${data.userEmail}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;${data.guestNames?.length || data.notes ? 'border-bottom:1px solid #F0EDE9;' : ''}color:#A1A1AA;letter-spacing:0.03em;">Party</td>
            <td style="padding:11px 0;${data.guestNames?.length || data.notes ? 'border-bottom:1px solid #F0EDE9;' : ''}color:#18181B;">${data.partySize}</td>
          </tr>
          ${data.guestNames?.length ? `
          <tr>
            <td style="padding:11px 0;${data.notes ? 'border-bottom:1px solid #F0EDE9;' : ''}color:#A1A1AA;vertical-align:top;letter-spacing:0.03em;">Guests</td>
            <td style="padding:11px 0;${data.notes ? 'border-bottom:1px solid #F0EDE9;' : ''}color:#18181B;line-height:1.7;">${data.guestNames.join('<br/>')}</td>
          </tr>` : ''}
          ${data.notes ? `
          <tr>
            <td style="padding:11px 0;color:#A1A1AA;vertical-align:top;letter-spacing:0.03em;">Notes</td>
            <td style="padding:11px 0;color:#18181B;">${data.notes}</td>
          </tr>` : ''}
        </table>

        <a href="https://clientdining.com/admin/bookings" style="display:inline-block;margin-top:24px;padding:9px 20px;background:#18181B;color:#fff;text-decoration:none;font-size:11px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;border-radius:3px;">View in admin</a>
      </div>
    `
  })
}

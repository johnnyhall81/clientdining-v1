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
        <p style="margin:0 0 4px;font-size:18px;font-weight:400;">New booking</p>
        <p style="margin:0 0 24px;font-size:13px;color:#71717A;">${ref}</p>

        <table style="border-top:1px solid #F4F4F5;width:100%;font-size:13px;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;color:#A1A1AA;width:120px;">Venue</td>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;">${data.venueName}${data.venueArea ? ` · ${data.venueArea}` : ''}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;color:#A1A1AA;">Date &amp; Time</td>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;">${data.slotTime}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;color:#A1A1AA;">Guest</td>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;">${data.userName} · ${data.userEmail}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;color:#A1A1AA;">Party size</td>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;">${data.partySize}</td>
          </tr>
          ${data.guestNames?.length ? `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;color:#A1A1AA;vertical-align:top;">Guests</td>
            <td style="padding:12px 0;border-bottom:1px solid #F4F4F5;line-height:1.8;">${data.guestNames.join('<br/>')}</td>
          </tr>
          ` : ''}
          ${data.notes ? `
          <tr>
            <td style="padding:12px 0;color:#A1A1AA;vertical-align:top;">Notes</td>
            <td style="padding:12px 0;">${data.notes}</td>
          </tr>
          ` : ''}
        </table>

        <a href="https://clientdining.com/admin/bookings" style="display:inline-block;margin-top:24px;padding:10px 20px;background:#18181B;color:#fff;text-decoration:none;font-size:13px;border-radius:8px;">View in admin</a>
      </div>
    `
  })
}
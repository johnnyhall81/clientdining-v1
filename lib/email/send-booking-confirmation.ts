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

const ROW = (label: string, value: string, last = false) => `
  <tr>
    <td style="padding:13px 0;${last ? '' : 'border-bottom:1px solid #F0EDE9;'}font-size:12px;font-weight:300;color:#A1A1AA;width:150px;vertical-align:top;letter-spacing:0.03em;">${label}</td>
    <td style="padding:13px 0;${last ? '' : 'border-bottom:1px solid #F0EDE9;'}font-size:13px;font-weight:300;color:#18181B;text-align:right;">${value}</td>
  </tr>`

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    const icsContent = generateIcs({
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      startTime: data.slotStartISO,
      partySize: data.partySize,
      bookingId: data.bookingId
    })

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.venueName}, ${data.venueAddress}, ${data.venuePostcode}`)}`
    const ref = data.bookingId.slice(0, 8).toUpperCase()

    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Confirmed — ${data.venueName}`,
      attachments: icsContent ? [{ filename: `booking-${data.bookingId.slice(0, 8)}.ics`, content: Buffer.from(icsContent).toString('base64') }] : [],
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
        <a href="${mapsUrl}" style="display:inline-block;margin:0 0 24px;font-size:12px;font-weight:300;color:#A1A1AA;text-decoration:none;">${data.venueAddress}${data.venuePostcode ? `, ${data.venuePostcode}` : ''}</a>

        <p style="margin:0 0 24px;font-size:11px;font-weight:300;color:#16A34A;letter-spacing:0.12em;text-transform:uppercase;">Table confirmed</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F0EDE9;">
          ${ROW('Date &amp; Time', data.slotTime)}
          ${ROW('Party', `${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}`)}
          ${data.venuePhone ? ROW('Phone', data.venuePhone) : ''}
          ${data.venueEmail ? ROW('Email', data.venueEmail) : ''}
          ${ROW('Reference', ref, !data.guestNames?.length)}
          ${data.guestNames?.length ? ROW('Guests', data.guestNames.join('<br/>'), true) : ''}
        </table>

        ${icsContent ? `<p style="margin:20px 0 0;font-size:12px;font-weight:300;color:#A1A1AA;">Calendar invite attached.</p>` : ''}

        <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
          <tr><td>
            <a href="https://clientdining.com/bookings" style="display:inline-block;padding:10px 24px;background-color:#18181B;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;border-radius:3px;">View booking</a>
          </td></tr>
        </table>

        <p style="margin:24px 0 0;font-size:12px;font-weight:300;color:#A1A1AA;line-height:1.7;">
          To make changes, contact the venue directly and quote your reference. To change the date or time, cancel and rebook from your bookings page.
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

    console.log('✅ Booking confirmation sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Booking confirmation failed:', error)
    return { success: false, error }
  }
}

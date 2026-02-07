import { Resend } from 'resend'
import { generateIcs } from '../calendar/generate-ics'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface BookingEmailData {
  userEmail: string
  userName: string
  venueName: string
  venueAddress: string
  venuePostcode: string
  venuePhone?: string
  venueEmail?: string
  slotTime: string
  slotStartISO: string
  partySize: number
  bookingId: string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    // Generate calendar file
    const icsContent = generateIcs({
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      startTime: data.slotStartISO,
      partySize: data.partySize,
      bookingId: data.bookingId
    })

    // Generate Google Maps link
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${data.venueName}, ${data.venueAddress}, ${data.venuePostcode}`
    )}`

    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Booking confirmed: ${data.venueName}`,
      attachments: icsContent ? [{
        filename: `booking-${data.bookingId.slice(0, 8)}.ics`,
        content: Buffer.from(icsContent).toString('base64')
      }] : [],
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #18181B;
                margin: 0;
                padding: 0;
                background: #FAFAFA;
                font-weight: 300;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: #FFFFFF; 
                color: #18181B; 
                padding: 40px 32px; 
                text-align: center;
                border-bottom: 1px solid #E4E4E7;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 300;
              }
              .content { 
                background: #FFFFFF; 
                padding: 32px; 
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #18181B;
                font-weight: 300;
              }
              .content strong {
                font-weight: 300;
              }
              .booking-details { 
                background: #FAFAFA; 
                padding: 24px; 
                border-radius: 8px; 
                margin: 24px 0;
                border: 1px solid #E4E4E7;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #E4E4E7;
                gap: 24px;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .detail-label { 
                font-weight: 300; 
                color: #71717A;
                font-size: 14px;
                min-width: 120px;
                flex-shrink: 0;
              }
              .detail-value { 
                color: #18181B;
                font-size: 16px;
                text-align: right;
                font-weight: 300;
              }
              .contact-info {
                background: #FAFAFA;
                padding: 16px 20px;
                border-radius: 6px;
                margin: 24px 0;
                border: 1px solid #E4E4E7;
              }
              .contact-info p {
                margin: 6px 0;
                font-size: 13px;
                color: #71717A;
                font-weight: 300;
              }
              .contact-info .heading {
                font-size: 13px;
                font-weight: 300;
                color: #71717A;
                margin-bottom: 8px;
              }
              .policy-note {
                padding: 16px 0;
                margin: 24px 0 0;
                font-size: 13px;
                color: #71717A;
                line-height: 1.5;
                font-weight: 300;
              }
              .footer { 
                text-align: center; 
                padding: 32px; 
                color: #A1A1AA; 
                font-size: 13px;
                background: #FAFAFA;
                font-weight: 300;
              }
              .footer p {
                margin: 8px 0;
              }
              .footer a {
                color: #A1A1AA;
                text-decoration: none;
                font-weight: 300;
              }
              .footer a:hover {
                color: #71717A;
                text-decoration: underline;
              }
              .button { 
                background: white; 
                color: #3F3F46 !important; 
                padding: 12px 28px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin: 8px 8px 8px 0;
                font-weight: 300;
                font-size: 15px;
                border: 1px solid #D4D4D8;
              }
              .button:hover {
                background: #FAFAFA;
                border-color: #A1A1AA;
              }
              .calendar-note {
                background: #F4F4F5;
                padding: 12px 16px;
                border-radius: 6px;
                margin: 16px 0;
                font-size: 14px;
                color: #71717A;
                border: 1px solid #E4E4E7;
                font-weight: 300;
              }
              .calendar-note strong {
                font-weight: 300;
              }
              .company-info {
                font-size: 11px;
                color: #A1A1AA;
                margin-top: 16px;
                line-height: 1.4;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking confirmed</h1>
              </div>
              
              <div class="content">
                <p>Your booking at <strong>${data.venueName}</strong> is confirmed.</p>
                
                <div class="booking-details">
                  <div class="detail-row">
                    <span class="detail-label">Venue</span>
                    <span class="detail-value">${data.venueName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${data.slotTime}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Party Size</span>
                    <span class="detail-value">${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${data.venueAddress}<br>${data.venuePostcode}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Reference</span>
                    <span class="detail-value">${data.bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                ${icsContent ? `
                  <div class="calendar-note">
                    📅 <strong>Calendar event attached</strong> — Open the .ics file to add this booking to your calendar.
                  </div>
                ` : ''}

                <center>
                  <a href="${mapsUrl}" class="button" target="_blank">Get directions</a>
                  <a href="https://clientdining.com/bookings" class="button">View bookings</a>
                </center>

                ${data.venuePhone || data.venueEmail ? `
                  <div class="contact-info">
                    <p class="heading">Venue contact</p>
                    ${data.venuePhone ? `<p>Phone: ${data.venuePhone}</p>` : ''}
                    ${data.venueEmail ? `<p>Email: ${data.venueEmail}</p>` : ''}
                  </div>
                ` : ''}

                <div class="policy-note">
                  You can cancel up to 24 hours in advance from your bookings page. Later cancellations may be subject to venue terms.
                </div>
              </div>
              
              <div class="footer">
                <p><a href="https://clientdining.com">clientdining.com</a></p>
                <div class="company-info">
                  CLIENTDINING LIMITED<br />
                  Company No: 17018817<br />
                  2 The Topiary, Ashtead, KT21 2TE
                </div>
              </div>
            </div>
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

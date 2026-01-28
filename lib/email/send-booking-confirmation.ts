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
      from: 'ClientDining <onboarding@resend.dev>',
      to: data.userEmail,
      subject: `Booking Confirmed: ${data.venueName}`,
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
                color: #111827;
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: #FFFFFF; 
                color: #111827; 
                padding: 40px 32px; 
                text-align: center;
                border-bottom: 1px solid #E5E7EB;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content { 
                background: #FFFFFF; 
                padding: 32px; 
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #111827;
              }
              .booking-details { 
                background: #F9FAFB; 
                padding: 24px; 
                border-radius: 8px; 
                margin: 24px 0;
                border-left: 4px solid #059669;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #E5E7EB;
                gap: 24px;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .detail-label { 
                font-weight: 600; 
                color: #6B7280;
                font-size: 14px;
                min-width: 120px;
                flex-shrink: 0;
              }
              .detail-value { 
                color: #111827;
                font-size: 16px;
                text-align: right;
              }
              .contact-info {
                background: #F9FAFB;
                padding: 20px 24px;
                border-radius: 8px;
                margin: 24px 0;
              }
              .contact-info p {
                margin: 8px 0;
                font-size: 14px;
              }
              .policy-box {
                background: #FEF3C7;
                border-left: 4px solid #F59E0B;
                padding: 16px 20px;
                margin: 24px 0;
                border-radius: 4px;
              }
              .policy-box p {
                margin: 0;
                font-size: 14px;
                color: #92400E;
              }
              .footer { 
                text-align: center; 
                padding: 32px; 
                color: #6B7280; 
                font-size: 14px;
                background: #F9FAFB;
              }
              .footer p {
                margin: 8px 0;
              }
              .footer a {
                color: #6B7280;
                text-decoration: none;
              }
              .button { 
                background: white; 
                color: #111827 !important; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin: 8px 8px 8px 0;
                font-weight: 600;
                font-size: 16px;
                border: 2px solid #111827;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmed</h1>
              </div>
              
              <div class="content">
                <p>Hello ${data.userName},</p>
                
                <p>You're all set for <strong>${data.venueName}</strong>.</p>
                
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

                <center>
                  ${icsContent ? `
                    <a href="data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}" 
                       download="booking-${data.bookingId.slice(0, 8)}.ics" 
                       class="button">
                      📅 Add to Calendar
                    </a>
                  ` : ''}
                  <a href="${mapsUrl}" class="button" target="_blank">
                    📍 Get Directions
                  </a>
                </center>

                ${data.venuePhone || data.venueEmail ? `
                  <div class="contact-info">
                    <p style="font-weight: 600; margin-bottom: 12px; color: #111827;">Venue Contact</p>
                    ${data.venuePhone ? `<p><strong>Phone:</strong> ${data.venuePhone}</p>` : ''}
                    ${data.venueEmail ? `<p><strong>Email:</strong> ${data.venueEmail}</p>` : ''}
                  </div>
                ` : ''}

                <div class="policy-box">
                  <p><strong>Cancellation Policy:</strong> You can cancel up to 24 hours in advance from your bookings page. Cancellations within 24 hours may be subject to the venue's terms.</p>
                </div>
                
                <center>
                  <a href="https://clientdining.com/bookings" class="button">View Bookings</a>
                </center>
              </div>
              
              <div class="footer">
                <p>London's best tables</p>
                <p><a href="https://clientdining.com">clientdining.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    })
    
    console.log('✅ Booking confirmation email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return { success: false, error }
  }
}
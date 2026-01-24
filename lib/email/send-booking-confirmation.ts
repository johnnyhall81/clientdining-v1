import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface BookingEmailData {
  userEmail: string
  userName: string
  venueName: string
  venueAddress: string
  slotTime: string
  partySize: number
  bookingId: string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Booking Confirmed: ${data.venueName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: 600; color: #666; }
              .detail-value { color: #1a1a1a; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .button { background: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmed</h1>
              </div>
              
              <div class="content">
                <p>Hello ${data.userName},</p>
                
                <p>Your reservation at <strong>${data.venueName}</strong> has been confirmed.</p>
                
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
                    <span class="detail-value">${data.partySize} guests</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Address</span>
                    <span class="detail-value">${data.venueAddress}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Booking Reference</span>
                    <span class="detail-value">${data.bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                
                <p><strong>Important:</strong> Please arrive on time. If you need to cancel, you can do so from your account page at least 24 hours in advance.</p>
                
                <center>
                  <a href="https://clientdining.com/bookings" class="button">View My Bookings</a>
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

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
      from: 'ClientDining <onboarding@resend.dev>',
      to: data.userEmail,
      subject: `Booking Confirmed: ${data.venueName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmed</h1>
              </div>
              <div class="content">
                <p>Hello ${data.userName},</p>
                <p>Your booking at <strong>${data.venueName}</strong> is confirmed.</p>
                <div class="details">
                  <p><strong>Date & Time:</strong> ${data.slotTime}</p>
                  <p><strong>Party Size:</strong> ${data.partySize} guests</p>
                  <p><strong>Venue:</strong> ${data.venueName}</p>
                  <p><strong>Address:</strong> ${data.venueAddress}</p>
                </div>
                <p><a href="https://clientdining.com/bookings">View Bookings</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    })
    
    console.log('✅ Booking email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send email :', error)
    return { success: false, error }
  }
}
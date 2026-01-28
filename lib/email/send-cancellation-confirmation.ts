import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface CancellationEmailData {
  userEmail: string
  userName: string
  venueName: string
  slotTime: string
  partySize: number
  bookingId: string
}

export async function sendCancellationConfirmation(data: CancellationEmailData) {
  try {
    await resend.emails.send({
      from: 'ClientDining <notifications@clientdining.com>',
      to: data.userEmail,
      subject: `Booking Cancelled: ${data.venueName}`,
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
                background: #111827; 
                color: white; 
                padding: 40px 32px; 
                text-align: center; 
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              .content { 
                background: #F9FAFB; 
                padding: 32px; 
              }
              .content p {
                margin: 0 0 16px 0;
                font-size: 16px;
                color: #111827;
              }
              .booking-details { 
                background: white; 
                padding: 24px; 
                border-radius: 8px; 
                margin: 24px 0;
                border-left: 4px solid #DC2626;
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Cancelled</h1>
              </div>
              
              <div class="content">
                <p>Hello ${data.userName},</p>
                
                <p>Your booking at <strong>${data.venueName}</strong> has been cancelled.</p>
                
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
                    <span class="detail-label">Reference</span>
                    <span class="detail-value">${data.bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                
                <p>We hope to see you soon.</p>
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
    
    console.log('✅ Cancellation email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error)
    return { success: false, error }
  }
}

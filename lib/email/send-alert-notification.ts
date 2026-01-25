import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface AlertEmailData {
  userEmail: string
  userName: string
  venueName: string
  venueAddress: string
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
      subject: `🔔 Slot Available: ${data.venueName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 30px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; }
              .alert-box { background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; }
              .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .detail-label { font-weight: 600; color: #666; }
              .detail-value { color: #1a1a1a; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .button { 
                background: #2563eb; 
                color: white !important; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin: 20px 0; 
                font-weight: 600; 
              }
              .urgent { color: #dc2626; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Your Alert is Active!</h1>
              </div>
              
              <div class="content">
                <p>Hello ${data.userName},</p>
                
                <div class="alert-box">
                  <p class="urgent">⚡ A slot you were waiting for is now available!</p>
                  <p style="margin: 10px 0 0 0;"><strong>You have 15 minutes to book this slot before it's offered to others.</strong></p>
                </div>
                
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
                    <span class="detail-value">${data.partySize}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${data.venueAddress}</span>
                  </div>
                </div>
                
                <p><strong>Important:</strong> This is a FIFO (First In, First Out) system. You were first to set an alert, so you get first chance to book. If you don't book within 15 minutes, the next person in the queue will be notified.</p>
                
                <center>
                  <a href="https://clientdining.com/api/bookings/quick?slot=${data.slotId}&redirect=/bookings" class="button" style="color: white;">Book This Slot Now</a>
                </center>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  This alert will expire in 15 minutes. Book quickly to secure your table!
                </p>
              </div>
              
              <div class="footer">
                <p>London's best tables</p>
                <p><a href="https://clientdining.com">clientdining.com</a></p>
                <p style="margin-top: 10px; font-size: 12px;">
                  <a href="https://clientdining.com/alerts" style="color: #666;">Manage my alerts</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })
    
    console.log('✅ Alert notification email sent to:', data.userEmail)
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to send alert email:', error)
    return { success: false, error }
  }
}

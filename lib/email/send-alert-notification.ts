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
      subject: `Table Available: ${data.venueName}`,
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
              .alert-box { 
                background: #FEF3C7; 
                border-left: 4px solid #D97706; 
                padding: 20px; 
                margin: 24px 0;
                border-radius: 8px;
              }
              .alert-box p {
                margin: 0;
                color: #92400E;
                font-weight: 600;
              }
              .booking-details { 
                background: white; 
                padding: 24px; 
                border-radius: 8px; 
                margin: 24px 0;
                border-left: 4px solid #D97706;
              }
              .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #E5E7EB;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .detail-label { 
                font-weight: 600; 
                color: #6B7280;
                font-size: 14px;
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
              .button { 
                background: #D97706; 
                color: white !important; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin: 24px 0;
                font-weight: 600;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Table Available</h1>
              </div>
              
              <div class="content">
                <p>Hello ${data.userName},</p>
                
                <div class="alert-box">
                  <p>Good news — a table is now available at ${data.venueName}.</p>
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
                
                <p>Book now to secure your table.</p>
                
                <center>
                  <a href="https://clientdining.com/venues/${data.venueId}" class="button" style="color: white;">View Venue</a>
                </center>
              </div>
              
              <div class="footer">
                <p>London's best tables</p>
                <p><a href="https://clientdining.com">clientdining.com</a></p>
                <p style="margin-top: 16px;">
                  <a href="https://clientdining.com/alerts" style="color: #6B7280; text-decoration: none;">Manage alerts</a>
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

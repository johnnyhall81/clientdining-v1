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
      subject: `Availability opened: ${data.venueName}`,
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
                background: #F9FAFB;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: #FFFFFF; 
                color: #6B7280; 
                padding: 32px 32px 24px; 
                text-align: center;
                border-bottom: 1px solid #E5E7EB;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
                color: #6B7280;
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
                border: 1px solid #E5E7EB;
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
                color: #9CA3AF; 
                font-size: 13px;
                background: #F9FAFB;
              }
              .footer p {
                margin: 8px 0;
              }
              .footer a {
                color: #9CA3AF;
                text-decoration: none;
              }
              .footer a:hover {
                color: #6B7280;
                text-decoration: underline;
              }
              .button { 
                background: white; 
                color: #374151 !important; 
                padding: 12px 28px; 
                text-decoration: none; 
                border-radius: 6px; 
                display: inline-block; 
                margin: 24px 0;
                font-weight: 500;
                font-size: 15px;
                border: 1px solid #D1D5DB;
              }
              .button:hover {
                background: #F9FAFB;
                border-color: #9CA3AF;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Table available</h1>
              </div>
              
              <div class="content">
                <p>A table you were watching is now available at ${data.venueName}.</p>
                
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
                    <span class="detail-label">Typical tables</span>
                    <span class="detail-value">${data.partySize}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${data.venueAddress}</span>
                  </div>
                </div>
                
                <center>
                  <a href="https://clientdining.com/venues/${data.venueId}" class="button">View availability</a>
                </center>
              </div>
              
              <div class="footer">
                <p><a href="https://clientdining.com">clientdining.com</a></p>
                <p style="margin-top: 16px;">
                  <a href="https://clientdining.com/alerts">Manage alerts</a>
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

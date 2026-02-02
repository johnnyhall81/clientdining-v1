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
                color: #71717A; 
                padding: 32px 32px 24px; 
                text-align: center;
                border-bottom: 1px solid #E4E4E7;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                font-weight: 300;
                color: #71717A;
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
                margin: 24px 0;
                font-weight: 300;
                font-size: 15px;
                border: 1px solid #D4D4D8;
              }
              .button:hover {
                background: #FAFAFA;
                border-color: #A1A1AA;
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

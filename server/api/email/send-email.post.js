// server/api/email/send-email.post.js
import { readMultipartFormData } from 'h3'
import { parse } from 'csv-parse/sync'

export default defineEventHandler(async (event) => {
  try {
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData) {
      return { success: false, message: 'No form data received' }
    }

    // Extract form fields
    const from = formData.find(part => part.name === 'from')?.data.toString() || ''
    const subject = formData.find(part => part.name === 'subject')?.data.toString() || ''
    const propertyId = formData.find(part => part.name === 'propertyId')?.data.toString() || ''
    const csvFile = formData.find(part => part.name === 'csvFile')

    // Validate required fields
    if (!from || !subject || !propertyId || !csvFile) {
      return { 
        success: false, 
        message: 'Missing required fields',
        received: { from, subject, propertyId, hasCsvFile: !!csvFile }
      }
    }

    // Get the runtime config to access SendGrid API key
    const config = useRuntimeConfig()

    // Get property data directly from your API
    const response = await fetch(`${config.public.apiBaseUrl}/properties/${propertyId}`)
    if (!response.ok) {
      return { success: false, message: `Failed to fetch property with ID ${propertyId}` }
    }
    const property = await response.json()
    
    if (!property || !property.ID) {
      return { success: false, message: `Property with ID ${propertyId} not found` }
    }

    // Parse CSV to extract emails
    const csvContent = csvFile.data.toString()
    const csvRows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    // Find and extract email column from CSV data
    const extractEmails = (rows) => {
      if (!rows || rows.length === 0) {
        throw new Error('CSV file has no data rows')
      }
      
      // Look for email column in headers
      const sampleRow = rows[0]
      const headers = Object.keys(sampleRow)
      const emailColumn = headers.find(header => 
        header.toLowerCase().includes('email')
      )

      if (!emailColumn) {
        throw new Error('Could not find email column in CSV. Make sure your CSV has a column named "email"')
      }

      // Extract valid emails
      return rows
        .map(row => row[emailColumn])
        .filter(email => email && typeof email === 'string' && email.includes('@') && email.includes('.'))
    }

    const emails = extractEmails(csvRows)
    if (emails.length === 0) {
      return { success: false, message: 'No valid email addresses found in CSV' }
    }

    // Generate email HTML template
    const emailHtml = generateEmailHtml(property)

    // Send emails using SendGrid
    const sentCount = await sendBulkEmails(emails, from, subject, emailHtml, config.public.SEND_GRID_API_KEY)

    return {
      success: true,
      message: `Sent ${sentCount} out of ${emails.length} emails successfully`,
      totalEmails: emails.length,
      sentEmails: sentCount
    }
  } catch (error) {
    console.error('Error sending marketing emails:', error)
    return {
      success: false,
      message: `Error: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
})

/**
 * Generate HTML email template
 * @param {Object} property Property data
 * @returns {string} HTML email content
 */
// Updated generateEmailHtml function with improved template
function generateEmailHtml(property) {
  // Parse images array from property
  let imageUrls = [];
  try {
    if (typeof property.images === 'string') {
      imageUrls = JSON.parse(property.images);
    } else if (Array.isArray(property.images)) {
      imageUrls = property.images;
    }
  } catch (error) {
    console.error('Error parsing property images:', error);
  }

  // Get first image for main display
  const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : '';
  
  // Format price with commas
  const formattedPrice = Number(property.price).toLocaleString('en-US');
  
  // Format beds and baths
  const bedBathText = `${property.bedrooms || 0} bed • ${property.bathrooms || 0} bath`;
  
  // Format living area
  const formattedLivingArea = property.living_area ? Number(property.living_area).toLocaleString('en-US') + ' sq ft' : 'N/A';
  
  // Create property card HTML
  const propertyCardHtml = `
    <div style="border-radius: 0.5rem; border: 1px solid #4A5568; background-color: #2D3748; margin-bottom: 1rem;">
      <div style="position: relative; width: 100%; height: 300px; background-color: #4A5568;">
        <img src="${mainImageUrl}" alt="Main image of the property" style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; object-fit: cover; object-position: center;" />
      </div>
      <div style="padding: 1rem;">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF;">
          <a href="https://urcreativesolutions.netlify.app/${property.ID}" style="color: inherit; text-decoration: none;">
            ${property.address}
          </a>
        </h3>
        <p style="font-size: 1.2rem; font-weight: 600; color: #FFFFFF; margin-bottom: 0.5rem;">$${formattedPrice}</p>
        <div style="display: flex; align-items: center; font-size: 0.875rem; color: #FFFFFF; margin-bottom: 0.5rem;">
          ${bedBathText} • ${formattedLivingArea}
        </div>
        <div style="font-size: 0.875rem; color: #FFFFFF;">
          Status: <span style="font-weight: 600; color: #9AE6B4;">Available</span>
        </div>
        ${property.transaction_document_url ? `
        <div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
          <a href="${property.transaction_document_url}" style="color: #4299E1; font-weight: 600; text-decoration: none;">View Documents</a>
        </div>
        ` : ''}
      </div>
      <div align="center" style="margin-bottom: 2rem;">
        <a href="https://urcreativesolutions.netlify.app/${property.ID}" style="line-height:inherit;color:rgb(255,255,255);text-decoration:none;box-sizing:border-box;display:inline-block;background-color:rgb(189,52,52);border-radius:4px;width:auto;max-width:100%;word-break:break-word;font-size:14px" target="_blank">
          <span style="line-height:16.799999px;display:block;padding:10px 20px">VIEW ALL DETAILS</span>
        </a>
      </div>
    </div>
  `;

  // Build the complete email template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Listings</title>
      <style>
        @media (max-width: 600px) {
          .container {
            padding: 1rem !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0;">
      <div class="wrapper" style="background-color: #000000; padding: 2rem;">
        <div class="container" style="margin-left: auto; margin-right: auto; max-width: 600px;">
          <div align="center" style="margin-bottom: 2rem;">
            <img src="https://i.imghippo.com/files/zSkI4664HY.png" alt="Logo" style="width: 25%; max-width: 100px;">
          </div>
          <h1 style="font-size: 1.5rem; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 2rem; text-align: center;">
            <span style="color: #4299E1;">EXPLORE</span> <span style="color: #FFFFFF">OUR LISTINGS</span>
          </h1>
          <div style="margin-bottom: 2rem; color: #FFFFFF;">
            <h1 style="font-size: 1.5rem; font-weight: 800; text-align: center;">
              THANKS FOR YOUR INTEREST!
            </h1>
            <p style="font-size: 1rem; margin-bottom: 1rem;">
              Hi,
            </p>
            <div style="margin-bottom: 2rem; color: #FFFFFF;">
              <p style="font-size: 1rem; margin-bottom: 1rem;">
                We have an exceptional investment opportunity in our Creative portfolio ready to be assigned. You can access the property details and documents via the view details button below.
              </p>
              <p style="font-size: 1rem; margin-bottom: 1rem;">
                It's essential to understand how this process works, and for that, you can visit our <a href="https://mycreativefinancing.online/" style="color: #4299E1;">closing process</a> and <a href="https://urcreativesolutions.online/" style="color: #4299E1;">creative financing</a> guide.
              </p>
              <p style="font-size: 1rem; margin-bottom: 1rem;">
                Interested in partnering with us? Please refer to our Joint Venture (JV) guide below for insights on collaboration opportunities.
              </p>
              <p style="font-size: 1rem; margin-bottom: 1rem;">
                New to our community? Click "Learn More" at the end of this email to get more information about our business and how we operate.
              </p>
              <p style="font-size: 1rem; margin-bottom: 1rem;">
                For questions, please contact our team.
              </p>
            </div>

            <div>
              ${propertyCardHtml}
            </div>
          </div>

          <div align="center" style="margin-top:10px;">
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdwW7fi80nALoUlmv63KRxdg9zb6CE0j9l6UF_tLMuGeInhVg/viewform?usp=sf_link" style="line-height:inherit;color:rgb(255,255,255);text-decoration:none;box-sizing:border-box;display:inline-block;background-color:rgb(0,0,0);border-radius:4px;width:auto;max-width:100%;word-break:break-word;font-size:16px" target="_blank">
              <span style="line-height:19.200001px;display:block;padding:10px 20px">
                <span style="line-height:19.2px">
                  <strong style="line-height:inherit">SUBMIT AN OFFER</strong>
                </span>
              </span>
            </a>
          </div>

          <div align="center" style="margin-top:10px;">
            <a href="https://mycreativefinancing.online/jvguide" style="line-height:inherit;color:rgb(255,255,255);text-decoration:none;box-sizing:border-box;display:inline-block;background-color:rgb(58,122,224);border-radius:4px;width:auto;max-width:100%;word-break:break-word;font-size:14px" target="_blank">
              <span style="line-height:16.799999px;display:block;padding:10px 20px">
                <span style="line-height:16.8px">JV GUIDE</span>
              </span>
            </a>
          </div>

          <div align="center" style="margin-top:2rem;">
            <img src="https://static.tildacdn.com/tild6637-3930-4861-b633-656631353339/noroot.png" alt="Property Image" style="width:100%;max-width:600px;border-radius:4px;">
          </div>

          <div class="container text-center" style="margin-left: auto; margin-right: auto; max-width: 600px;">
            <p style="font-size: 1rem; margin-bottom: 1rem;color:#FFFFFF;">
              CONFIDENTIALITY NOTICE: The information contained in this email is confidential.
            </p>
            <p style="font-size: 1rem; margin-bottom: 1rem;color:#FFFFFF">
              Important: recipient, you are hereby notified that any use, disclosure, dissemination, distribution, or copying of this information is strictly prohibited. Any information provided to you by UR Creative Services, or affiliated parties is strictly done for informational purposes.
            </p>
          </div>
          
          <div align="center" style="margin-top: 20px;">
            <p style="font-size: 12px; color: #A0AEC0;">
              If you no longer wish to receive emails from us, 
              <a href="https://urcreativesolutions.com/unsubscribe" style="color: #4299E1; text-decoration: none;">click here to unsubscribe</a>.
            </p>
          </div>

          <div style="line-height:inherit;padding:0px">
            <div style="line-height:inherit;margin:0px auto;min-width:320px;max-width:600px;word-break:break-word;background-color:rgb(229,234,245);width:100%">
              <div style="line-height:inherit;border-collapse:collapse;display:table;width:100%;">
                <div style="line-height:inherit;vertical-align:top;max-width:320px;min-width:600px;display:table-cell;width:600px">
                  <div style="line-height:inherit;width:100%">
                    <div style="line-height:inherit;box-sizing:border-box;padding:0px;border-width:0px;border-style:solid;border-color:transparent">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="line-height:inherit;vertical-align:top;border-collapse:collapse;font-family:Cabin,sans-serif">
                        <tbody style="line-height:inherit">
                          <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                            <td align="left" style="line-height:inherit;vertical-align:top;border-collapse:collapse;word-break:break-word;padding:10px">
                              <div align="center" style="line-height:inherit">
                                <a href="https://urcreativesolutions.netlify.app/" style="line-height:inherit;color:rgb(255,255,255);text-decoration:none;box-sizing:border-box;display:inline-block;background-color:rgb(0,0,0);border-radius:4px;width:auto;max-width:100%;word-break:break-word;font-size:14px" target="_blank">
                                  <span style="line-height:16.799999px;display:block;padding:10px 20px">
                                    <span style="line-height:16.8px;color:rgb(255,255,255);">AVAILABLE PROPERTIES</span>
                                  </span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="line-height:inherit;vertical-align:top;border-collapse:collapse;font-family:Cabin,sans-serif">
                        <tbody style="line-height:inherit">
                          <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                            <td align="left" style="line-height:inherit;vertical-align:top;border-collapse:collapse;word-break:break-word;padding:10px">
                              <div align="center" style="line-height:inherit">
                                <a href="https://docs.google.com/forms/d/e/1FAIpQLSeThyCr9ClwOk-RDZ15aKmmUnnuPxPbC8D3rN3qb5P2WzENqA/viewform?usp=sf_link" style="line-height:inherit;color:rgb(255,255,255);text-decoration:none;box-sizing:border-box;display:inline-block;background-color:rgb(58,88,224);border-radius:4px;width:auto;max-width:100%;word-break:break-word;font-size:14px" target="_blank">
                                  <span style="line-height:16.799999px;display:block;padding:10px 20px">
                                    <span style="line-height:16.8px;color:rgb(255,255,255);">LEARN MORE</span>
                                  </span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0" style="line-height:inherit;vertical-align:top;border-collapse:collapse;font-family:Cabin,sans-serif">
                        <tbody style="line-height:inherit">
                          <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                            <td align="left" style="line-height:inherit;vertical-align:top;border-collapse:collapse;word-break:break-word;padding:10px 10px 33px">
                              <div align="center" style="line-height:inherit">
                                <div style="line-height:inherit;display:table;max-width:195px">
                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="line-height:inherit;vertical-align:top;border-collapse:collapse;display:inline-block;table-layout:fixed;border-spacing:0px;margin-right:17px;width:32px;height:32px">
                                    <tbody style="line-height:inherit">
                                      <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                                        <td align="left" valign="middle" style="line-height:inherit;vertical-align:top;word-break:break-word;border-collapse:collapse">
                                          <a href="https://www.facebook.com/people/UR-Creative/61559852412673/" title="Facebook" style="line-height:inherit;" target="_blank">
                                            <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png" alt="Facebook" title="Facebook" width="32" style="line-height:inherit;outline:currentcolor;text-decoration:none;clear:both;border:medium;height:auto;float:none;display:block;max-width:32px">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="line-height:inherit;vertical-align:top;border-collapse:collapse;display:inline-block;table-layout:fixed;border-spacing:0px;margin-right:17px;width:32px;height:32px">
                                    <tbody style="line-height:inherit">
                                      <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                                        <td align="left" valign="middle" style="line-height:inherit;vertical-align:top;word-break:break-word;border-collapse:collapse">
                                          <a href="https://www.instagram.com/russogrecco?igsh=bzFlb3d3bzRtMmc2&utm_source=qr" title="Instagram" style="line-height:inherit;" target="_blank">
                                            <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" title="Instagram" width="32" style="line-height:inherit;outline:currentcolor;text-decoration:none;clear:both;border:medium;height:auto;float:none;display:block;max-width:32px">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="line-height:inherit;vertical-align:top;border-collapse:collapse;display:inline-block;table-layout:fixed;border-spacing:0px;margin-right:17px;width:32px;height:32px">
                                    <tbody style="line-height:inherit">
                                      <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                                        <td align="left" valign="middle" style="line-height:inherit;vertical-align:top;word-break:break-word;border-collapse:collapse">
                                          <a href="https://youtube.com/@mycreativefinancing?feature=shared" title="YouTube" style="line-height:inherit;" target="_blank">
                                            <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/youtube.png" alt="YouTube" title="YouTube" width="32" style="line-height:inherit;outline:currentcolor;text-decoration:none;clear:both;border:medium;height:auto;float:none;display:block;max-width:32px">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="line-height:inherit;vertical-align:top;border-collapse:collapse;display:inline-block;table-layout:fixed;border-spacing:0px;margin-right:0px;width:32px;height:32px">
                                    <tbody style="line-height:inherit">
                                      <tr style="line-height:inherit;vertical-align:top;border-collapse:collapse">
                                        <td align="left" valign="middle" style="line-height:inherit;vertical-align:top;word-break:break-word;border-collapse:collapse">
                                          <a href="mailto:rahul@urcreativesolutions.com" title="Email" style="line-height:inherit;" target="_blank">
                                            <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/email.png" alt="Email" title="Email" width="32" style="line-height:inherit;outline:currentcolor;text-decoration:none;clear:both;border:medium;height:auto;float:none;display:block;max-width:32px">
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send bulk emails using SendGrid
 * @param {Array<string>} emails List of email addresses
 * @param {string} from Sender email
 * @param {string} subject Email subject
 * @param {string} html Email HTML content
 * @param {string} apiKey SendGrid API key
 * @returns {Promise<number>} Number of emails sent successfully
 */
async function sendBulkEmails(emails, from, subject, html, apiKey) {
  if (!apiKey) {
    throw new Error('SendGrid API key is required')
  }

  // Prepare tracking for successful sends
  let successCount = 0

  // Send emails in batches to avoid rate limits (100 at a time)
  const batchSize = 100
  const batches = []
  
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize))
  }

  // Process each batch
  for (const batch of batches) {
    const results = await Promise.allSettled(
      batch.map(async (to) => {
        try {
          await sendSingleEmail(to, from, subject, html, apiKey)
          return true
        } catch (error) {
          console.error(`Failed to send email to ${to}:`, error)
          return false
        }
      })
    )

    // Count successful sends
    successCount += results.filter(result => 
      result.status === 'fulfilled' && result.value === true
    ).length
    
    // Small delay between batches
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return successCount
}

/**
 * Send a single email using SendGrid API
 * @param {string} to Recipient email
 * @param {string} from Sender email
 * @param {string} subject Email subject
 * @param {string} html Email HTML content
 * @param {string} apiKey SendGrid API key
 * @returns {Promise<void>}
 */
async function sendSingleEmail(to, from, subject, html, apiKey) {
  const url = 'https://api.sendgrid.com/v3/mail/send'
  
  const requestBody = {
    personalizations: [
      {
        to: [{ email: to }]
      }
    ],
    from: { email: from },
    subject: subject,
    content: [
      {
        type: 'text/html',
        value: html
      }
    ]
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`SendGrid API error (${response.status}): ${errorText}`)
  }
}
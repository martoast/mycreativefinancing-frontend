const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

exports.handler = async (event, context) => {
  console.log('Function invoked with event:', JSON.stringify(event));

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SHEETS_API_CREDENTIALS);
  } catch (error) {
    console.error('Error parsing GOOGLE_SHEETS_API_CREDENTIALS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error parsing credentials', details: error.message })
    };
  }

  if (!credentials.client_email || !credentials.private_key) {
    console.error('Invalid credentials structure');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Invalid credentials structure' })
    };
  }

  const jwtClient = new JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  try {
    console.log('Authorizing JWT client');
    await jwtClient.authorize();
  } catch (error) {
    console.error('JWT authorization failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Authentication failed', details: error.message })
    };
  }

  const sheets = google.sheets({ version: 'v4', auth: jwtClient });

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body', details: error.message })
    };
  }

  const property = requestBody.property;

  if (!property || !property.address) {
    console.error('Missing property address');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Property address is required' })
    };
  }

  const spreadsheetId = '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU';

  const safeToString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const headers = Object.keys(property);
  const values = headers.map(header => safeToString(property[header]));

  const resource = {
    values: [values]
  };

  try {
    console.log('Appending data to Google Sheet');
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'main',
      valueInputOption: 'USER_ENTERED',
      resource
    });

    console.log('Append response:', JSON.stringify(response.data));

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Data written to sheet successfully',
        updatedRange: response.data.updates.updatedRange
      })
    };
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    let errorMessage = 'Error writing to sheet';
    let statusCode = 500;

    if (error.code === 403) {
      errorMessage = 'Permission denied. Check the spreadsheet ID and credentials.';
    } else if (error.code === 404) {
      errorMessage = 'Spreadsheet not found. Check the spreadsheet ID.';
    } else if (error.code === 429) {
      errorMessage = 'Too many requests. Please try again later.';
      statusCode = 429;
    }

    return {
      statusCode: statusCode,
      body: JSON.stringify({ 
        error: errorMessage, 
        details: error.message,
        code: error.code
      })
    };
  }
};
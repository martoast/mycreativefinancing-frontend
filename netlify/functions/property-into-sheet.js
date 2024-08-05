const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

exports.handler = async (event, context) => {
  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SHEETS_API_CREDENTIALS);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error parsing GOOGLE_SHEETS_API_CREDENTIALS', details: error.message })
    };
  }

  const jwtClient = new JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  try {
    await jwtClient.authorize();

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON in request body', details: error.message })
      };
    }

    const property = requestBody.property;

    if (!property || !property.address) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Property address is required' })
      };
    }

    const spreadsheetId = '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU';

    // Function to safely convert values to strings
    const safeToString = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    };

    const headers = Object.keys(property).slice(0, 26); // Limit to 26 columns
    const values = headers.map(header => safeToString(property[header]));

    const resource = {
      values: [values]
    };

    const response = sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'main!A:Z', // Explicitly set range to A:Z
      valueInputOption: 'USER_ENTERED',
      resource
    });

    console.log('Append response:', response.data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data written to sheet successfully' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error writing to sheet', details: error.message })
    };
  }
};

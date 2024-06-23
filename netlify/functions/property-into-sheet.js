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

    const spreadsheetId = '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU'; // Replace with your Google Sheet ID

    const headers = Object.keys(property);
    const values = headers.map(header => property[header]);

    // Get the current number of rows in the sheet
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'main!A:A' // Adjust the range to match your data layout
    });

    const rowCount = sheetData.data.values ? sheetData.data.values.length : 0;

    // Write the data to the next available row
    const resource = {
      values: [values]
    };

    sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'main!A:A', // Adjust the range to match your data layout
      valueInputOption: 'USER_ENTERED',
      resource
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data written to sheet successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error writing to sheet', details: error.message })
    };
  }
};

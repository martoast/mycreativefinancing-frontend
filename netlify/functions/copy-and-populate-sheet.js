const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

exports.handler = async (event, context) => {
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
  const spreadsheetId = '16U8KuQzV2jMaKINl3aZsu7yqPDEhDxtAteiwpALbAtQ'; // Replace with your Google Sheet ID

  const jwtClient = new JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  try {
    await jwtClient.authorize();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Authorization successful' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error during authorization', details: error.message })
    };
  }
};

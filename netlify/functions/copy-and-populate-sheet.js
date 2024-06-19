const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

exports.handler = async (event, context) => {
  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_MAPS_API_CREDENTIALS);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error parsing GOOGLE_MAPS_API_CREDENTIALS', details: error.message })
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

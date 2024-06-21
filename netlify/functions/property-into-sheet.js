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

    // Get the current number of columns in the sheet
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [],
      includeGridData: false
    });

    const currentSheet = sheetInfo.data.sheets.find(sheet => sheet.properties.title === "main");
    if (!currentSheet) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Sheet "main" not found' })
      };
    }
    const sheetId = currentSheet.properties.sheetId;
    const currentColumnCount = currentSheet.properties.gridProperties.columnCount;

    // Ensure the sheet has enough columns
    if (headers.length > currentColumnCount) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              appendDimension: {
                sheetId,
                dimension: 'COLUMNS',
                length: headers.length - currentColumnCount
              }
            }
          ]
        }
      });
    }

    // Get the current data from the sheet
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'main!A1:1' // Check the first row for headers
    });

    const headerRow = sheetData.data.values ? sheetData.data.values[0] : [];

    const requests = [];

    // Write the data to the next available row
    const rowCount = sheetData.data.values ? sheetData.data.values.length : 0;
    requests.push({
      updateCells: {
        start: { sheetId, rowIndex: rowCount, columnIndex: 0 },
        rows: [{
          values: values.map(value => ({
            userEnteredValue: { stringValue: typeof value === 'object' ? JSON.stringify(value) : String(value) }
          }))
        }],
        fields: 'userEnteredValue'
      }
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests
      }
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

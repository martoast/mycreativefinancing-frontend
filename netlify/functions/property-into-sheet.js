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
    const sheetId = 0; // Assuming you want to write to the first sheet

    const headers = Object.keys(property);
    const values = headers.map(header => property[header]);

    // Get the current number of columns in the sheet
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [],
      includeGridData: false
    });

    const currentSheet = sheetInfo.data.sheets.find(sheet => sheet.properties.sheetId === sheetId);
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
      range: 'Sheet1!A1:Z1'
    });

    const headerRow = sheetData.data.values ? sheetData.data.values[0] : [];

    const requests = [];

    // If the header row doesn't exist, write it
    if (headerRow.length === 0) {
      requests.push({
        updateCells: {
          start: { sheetId, rowIndex: 0, columnIndex: 0 },
          rows: [{
            values: headers.map(header => ({
              userEnteredValue: { stringValue: header }
            }))
          }],
          fields: 'userEnteredValue'
        }
      });
    }

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

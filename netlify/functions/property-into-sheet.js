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

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const newSheetName = `${property.address} ${formattedDate}`;

    // Step 1: Copy the existing sheet
    const copyResponse = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU', // Replace with your Google Sheet ID
      sheetId: 0, // Assuming Sheet1 has ID 0, you might need to adjust this
      requestBody: {
        destinationSpreadsheetId: '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU'
      }
    });

    const newSheetId = copyResponse.data.sheetId;

    // Step 2: Rename the new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU',
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: newSheetId,
                title: newSheetName
              },
              fields: 'title'
            }
          }
        ]
      }
    });

    // Step 3: Ensure the new sheet has enough columns
    const headers = Object.keys(property);
    const maxColumnIndex = headers.length;

    // Get the current number of columns in the sheet
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU',
      ranges: [],
      includeGridData: false
    });

    const currentSheet = sheetInfo.data.sheets.find(sheet => sheet.properties.sheetId === newSheetId);
    const currentColumnCount = currentSheet.properties.gridProperties.columnCount;

    if (maxColumnIndex > currentColumnCount) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU',
        requestBody: {
          requests: [
            {
              appendDimension: {
                sheetId: newSheetId,
                dimension: 'COLUMNS',
                length: maxColumnIndex - currentColumnCount
              }
            }
          ]
        }
      });
    }

    // Step 4: Populate the new sheet with the provided data
    const values = headers.map(header => property[header]);

    const requests = [
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 0, columnIndex: 0 },
          rows: [{
            values: headers.map(header => ({
              userEnteredValue: { stringValue: header }
            }))
          }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 1, columnIndex: 0 },
          rows: [{
            values: values.map(value => ({
              userEnteredValue: { stringValue: typeof value === 'object' ? JSON.stringify(value) : String(value) }
            }))
          }],
          fields: 'userEnteredValue'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1minoEorYBxEG78SfoEoGxIjCBO2g4rUGX5jr1ZK0wfU',
      requestBody: {
        requests: requests
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sheet copied, renamed, and populated successfully', newSheetName })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error copying, renaming, and populating sheet', details: error.message })
    };
  }
};

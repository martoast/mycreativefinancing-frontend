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

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    const requestBody = JSON.parse(event.body);
    const property = requestBody.property;

    // Generate a new sheet name using the property address
    const newSheetName = 'NET SHEET: ' + property.address;

    // Step 1: Copy the existing sheet
    const copyResponse = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: spreadsheetId,
      sheetId: 0, // Assuming Sheet1 has ID 0, you might need to adjust this
      requestBody: {
        destinationSpreadsheetId: spreadsheetId
      }
    });

    const newSheetId = copyResponse.data.sheetId;

    // Step 2: Rename the new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
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

    // Step 3: Populate the new sheet with the provided data
    const requests = [
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 2, columnIndex: 3 }, // D3
          rows: [{ values: [{ userEnteredValue: { stringValue: property.address } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 9, columnIndex: 3 }, // D10
          rows: [{ values: [{ userEnteredValue: { numberValue: property.interest_rate } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 11, columnIndex: 3 }, // D12
          rows: [{ values: [{ userEnteredValue: { numberValue: property.balance_to_close } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 12, columnIndex: 3 }, // D13
          rows: [{ values: [{ userEnteredValue: { numberValue: property.monthly_holding_cost } }] }],
          fields: 'userEnteredValue'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
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

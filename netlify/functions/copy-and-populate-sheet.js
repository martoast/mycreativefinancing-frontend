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

    const newSheetName = `NET SHEET: ${property.address} ${formattedDate}`;

    // Step 1: Copy the existing sheet
    const copyResponse = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc', // Replace with your Google Sheet ID
      sheetId: 0, // Assuming Sheet1 has ID 0, you might need to adjust this
      requestBody: {
        destinationSpreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc'
      }
    });

    const newSheetId = copyResponse.data.sheetId;

    // Step 2: Rename the new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc',
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
          start: { sheetId: newSheetId, rowIndex: 2, columnIndex: 1 }, // B3
          rows: [{ values: [{ userEnteredValue: { stringValue: property.address } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 9, columnIndex: 6 }, // G10
          rows: [{ values: [{ userEnteredValue: { numberValue: parseFloat(property.interest_rate) / 100 } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 10, columnIndex: 6 }, // G11
          rows: [{ values: [{ userEnteredValue: { numberValue: property.purchase_price } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 11, columnIndex: 6 }, // G12
          rows: [{ values: [{ userEnteredValue: { numberValue: property.balance_to_close } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 12, columnIndex: 6 }, // G13
          rows: [{ values: [{ userEnteredValue: { numberValue: property.monthly_holding_cost } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 17, columnIndex: 3 }, // D18
          rows: [{ values: [{ userEnteredValue: { stringValue: property.transaction_document_url } }] }],
          fields: 'userEnteredValue'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc',
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

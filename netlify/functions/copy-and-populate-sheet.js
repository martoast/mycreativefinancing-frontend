const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

exports.handler = async (event, context) => {
  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SHEETS_API_CREDENTIALS);
  } catch (error) {
    console.error('Error parsing credentials:', error);
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
      console.error('Error parsing request body:', error);
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

    // Validate other required fields
    const requiredFields = ['purchase_price', 'balance_to_close', 'monthly_holding_cost', 'interest_rate'];
    for (const field of requiredFields) {
      if (typeof property[field] === 'undefined') {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `${field} is required` })
        };
      }
    }

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    // Function to truncate address
    const truncateAddress = (address, maxLength) => {
      if (address.length <= maxLength) return address;
      return address.substring(0, maxLength - 3) + '...';
    };

    // Function to generate sheet name
    const generateSheetName = (address, date, attempt = 0) => {
      const truncatedAddress = truncateAddress(address, 70); // Leave room for date and potential number
      let sheetName = `NET SHEET: ${truncatedAddress} ${date}`;
      if (attempt > 0) {
        sheetName += ` (${attempt})`;
      }
      return sheetName.substring(0, 100); // Ensure final name is not over 100 characters
    };

    // Function to check if sheet name exists
    const sheetNameExists = async (name) => {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc'
      });
      return response.data.sheets.some(sheet => sheet.properties.title === name);
    };

    // Generate unique sheet name
    let newSheetName;
    let attempt = 0;
    do {
      newSheetName = generateSheetName(property.address, formattedDate, attempt);
      attempt++;
    } while (await sheetNameExists(newSheetName));

    console.log(`Generated unique sheet name: ${newSheetName}`);

    // Step 1: Copy the existing sheet
    console.log('Copying sheet...');
    const copyResponse = await sheets.spreadsheets.sheets.copyTo({
      spreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc',
      sheetId: 0,
      requestBody: {
        destinationSpreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc'
      }
    });

    const newSheetId = copyResponse.data.sheetId;
    console.log('Sheet copied successfully');

    // Step 2: Rename the new sheet
    console.log('Renaming sheet...');
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
    console.log('Sheet renamed successfully');

    // Step 3: Populate the new sheet with the provided data
    console.log('Populating sheet...');
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
          rows: [{ values: [{ userEnteredValue: { numberValue: parseFloat(property.purchase_price) } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 11, columnIndex: 6 }, // G12
          rows: [{ values: [{ userEnteredValue: { numberValue: parseFloat(property.balance_to_close) } }] }],
          fields: 'userEnteredValue'
        }
      },
      {
        updateCells: {
          start: { sheetId: newSheetId, rowIndex: 12, columnIndex: 6 }, // G13
          rows: [{ values: [{ userEnteredValue: { numberValue: parseFloat(property.monthly_holding_cost) } }] }],
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

    // Add price_breakdown if it exists
    if (property.price_breakdown) {
      requests.push(
        {
          updateCells: {
            start: { sheetId: newSheetId, rowIndex: 19, columnIndex: 3 }, // D20
            rows: [{ 
              values: [{ 
                userEnteredValue: { stringValue: property.price_breakdown }
              }]
            }],
            fields: 'userEnteredValue'
          }
        }
      );
    }


    

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: '1IP924Kd0ytytZ823PDr4K3IxpVBq1XmTkIxG5ySdTSc',
      requestBody: {
        requests: requests
      }
    });
    console.log('Sheet populated successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sheet copied, renamed, and populated successfully', newSheetName })
    };
  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error processing sheet', 
        details: error.message 
      })
    };
  }
};
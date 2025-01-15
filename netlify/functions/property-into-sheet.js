const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Ordered fields to ensure data matches sheet headers
const ORDERED_FIELDS = [
 'ID', 'CreatedAt', 'UpdatedAt', 'DeletedAt', 'address', 'price',
 'description', 'images', 'sold', 'bedrooms', 'bathrooms', 
 'rent_zestimate', 'zestimate', 'property_type', 'zoning', 
 'year_built', 'lot_size', 'price_per_square_foot', 'living_area',
 'purchase_price', 'balance_to_close', 'monthly_holding_cost',
 'interest_rate', 'nearby_hospitals', 'nearby_schools', 'nearby_homes',
 'price_history', 'tax_history', 'contact_recipients', 'monthly_hoa_fee',
 'transaction_document_url', 'benefit_sheet_url', 'escrow',
 'deal_holder', 'in_house_deal', 'rental_restriction',
 'price_breakdown', 'additional_benefits'
];

const safeToString = (value) => {
 if (value === null || value === undefined) return '';
 if (Array.isArray(value) || typeof value === 'object') {
   try {
     return JSON.stringify(value);
   } catch (e) {
     console.warn('Failed to stringify value:', e);
     return '';
   }
 }
 return String(value);
};

exports.handler = async (event, context) => {
 try {
   // Parse credentials
   const credentials = JSON.parse(process.env.GOOGLE_SHEETS_API_CREDENTIALS);
   if (!credentials.client_email || !credentials.private_key) {
     throw new Error('Invalid Google Sheets credentials structure');
   }

   // Setup JWT client
   const jwtClient = new JWT(
     credentials.client_email,
     null,
     credentials.private_key.replace(/\\n/g, '\n'),
     ['https://www.googleapis.com/auth/spreadsheets']
   );

   console.log('Authorizing JWT client...');
   await jwtClient.authorize();

   const sheets = google.sheets({ version: 'v4', auth: jwtClient });

   // Parse request body
   const { property } = JSON.parse(event.body);
   if (!property || !property.address) {
     throw new Error('No property data or address provided');
   }

   // Format data in correct order
   const values = ORDERED_FIELDS.map(field => safeToString(property[field] || ''));

   console.log('Appending data to Google Sheet...');
   const response = await sheets.spreadsheets.values.append({
     spreadsheetId: '1-KORQc7eQHidXeZ5cVuA5VR73NfeRQ_IKVO8nkkWEWM',
     range: 'Sheet1',
     valueInputOption: 'USER_ENTERED',
     resource: { values: [values] }
   });

   console.log('Successfully wrote data to sheet');
   return {
     statusCode: 200,
     body: JSON.stringify({
       message: 'Data written to sheet successfully',
       updatedRange: response.data.updates.updatedRange
     })
   };

 } catch (error) {
   console.error('Error in property-into-sheet function:', error);
   console.error('Error details:', {
     message: error.message,
     code: error.code,
     stack: error.stack
   });

   const errorMessages = {
     403: 'Permission denied. Check spreadsheet ID and credentials.',
     404: 'Spreadsheet not found. Check spreadsheet ID.',
     429: 'Too many requests. Please try again later.',
   };

   return {
     statusCode: error.code || 500,
     body: JSON.stringify({
       error: errorMessages[error.code] || 'Internal server error',
       details: error.message,
       code: error.code
     })
   };
 }
};
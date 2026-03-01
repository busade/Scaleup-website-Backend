import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import logger from './logger.js';

/**
 * @desc    Append a new row to the Google Sheet
 * @param   {Object} data - Application data
 */
export const appendRowToSheet = async (data) => {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      logger.warn('Google Sheets configuration missing. Skipping sync.');
      return;
    }

    const auth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);

    // load doc info
    await doc.loadInfo();
    
    // get the first sheet
    const sheet = doc.sheetsByIndex[0];

    // Ensure headers exist (if sheet is empty, add them)
    await sheet.loadHeaderRow().catch(async () => {
      logger.info('Sheet appears to be empty. Setting header row...');
      await sheet.setHeaderRow([
        'First Name', 'Last Name', 'Email', 'Phone Number', 'Location', 
        'LinkedIn', 'Skills', 'Availability', 'Why Volunteer', 
        'Relevant Experience', 'CV Link', 'Submitted At'
      ]);
    });

    // Append row
    await sheet.addRow({
      'First Name': data.firstName,
      'Last Name': data.lastName,
      'Email': data.email,
      'Phone Number': data.phoneNumber,
      'Location': data.location,
      'LinkedIn': data.linkedIn,
      'Skills': data.skills?.join(', ') || '',
      'Availability': data.availability,
      'Why Volunteer': data.whyVolunteer,
      'Relevant Experience': data.relevantExperience,
      'CV Link': data.cv,
      'Submitted At': new Date().toLocaleString()
    });

    logger.info('Successfully synced application to Google Sheets');
  } catch (error) {
    logger.error('Google Sheets Sync Error: %o', error);
    // We don't throw here to avoid failing the whole request if only the sheet update fails
  }
};

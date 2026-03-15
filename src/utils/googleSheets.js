import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import logger from './logger.js';

const sheetsConfig = {
  Applications: {
    headers: [
      'First Name', 'Last Name', 'Email', 'Phone Number', 'Location',
      'LinkedIn', 'Skills', 'Availability', 'Why Volunteer',
      'Relevant Experience', 'CV Link', 'Submitted At'
    ],
    mapRow: (data) => ({
      'First Name': data.firstName,
      'Last Name': data.lastName,
      'Email': data.email,
      'Phone Number': data.phoneNumber,
      'Location': data.location,
      'LinkedIn': data.linkedIn,
      'Skills': Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
      'Availability': data.availability,
      'Why Volunteer': data.whyVolunteer,
      'Relevant Experience': data.relevantExperience,
      'CV Link': data.cv,
      'Submitted At': data.submittedAt || new Date().toLocaleString(),
    }),
  },
  Contacts: {
    headers: ['Name', 'Email', 'Subject', 'Message', 'Submitted At'],
    mapRow: (data) => ({
      'Name': data.name,
      'Email': data.email,
      'Subject': data.subject,
      'Message': data.message,
      'Submitted At': data.submittedAt || new Date().toLocaleString(),
    }),
  },
  Waitlist:{
    headers: ['Email', 'Submitted At'],
    mapRow: (data) => ({
      'Email': data.email,
      'Submitted At': data.submittedAt || new Date().toLocaleString(),
    }),
  }
};

/**
 * @desc    Append a new row to the Google Sheet
 * @param   {Object} data - data to append
 * @param   {string} sheetName - Name of the sheet to append data to
 */
export const appendRowToSheet = async (data, sheetName) => {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      logger.warn('Google Sheets configuration missing. Skipping sync.');
      return;
    }

    const inferSheetFromData = () => {
      if (data?.name && data?.subject && data?.message) return 'Contacts';
      if (data?.firstName && data?.lastName && data?.email) return 'Applications';
      if (data?.email) return 'Waitlist';
      return null;
    };

    const targetSheetName =
      sheetName ||
      inferSheetFromData() ||
      process.env.GOOGLE_CONTACTS_SHEET_NAME ||
      process.env.GOOGLE_APPLICATIONS_SHEET_NAME ||
      'Applications';

    const config = sheetsConfig[targetSheetName] || sheetsConfig.Applications;

    const auth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);

    await doc.loadInfo();

    let sheet = doc.sheetsByTitle[targetSheetName];
    if (!sheet) {
      logger.info(`Sheet "${targetSheetName}" not found, creating it.`);
      sheet = await doc.addSheet({ title: targetSheetName, headerValues: config.headers });
    }

    await sheet.loadHeaderRow().catch(async () => {
      logger.info(`Sheet "${targetSheetName}" appears empty. Setting header row...`);
      await sheet.setHeaderRow(config.headers);
    });

    await sheet.addRow(config.mapRow(data));

    logger.info(`Successfully synced ${targetSheetName} to Google Sheets`);
  } catch (error) {
    logger.error('Google Sheets Sync Error: %o', error);
  }
};

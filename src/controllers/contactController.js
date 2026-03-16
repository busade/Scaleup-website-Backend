import Contact from '../models/contact.js';
import logger from '../utils/logger.js';
import validator from 'validator';
import { appendRowToSheet } from '../utils/googleSheets.js';
import Waitlist from '../models/user.js';
/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const contact = await Contact.create({ name, email, subject, message });

    logger.info(`New contact message received from ${email}. ID: ${contact._id}`);

    // Write to Google Sheets (Contacts sheet)
    try {
      await appendRowToSheet(
        {
          name,
          email,
          subject,
          message,
          submittedAt: new Date().toLocaleString(),
        },
        process.env.GOOGLE_CONTACTS_SHEET_NAME || 'Contacts'
      );
      logger.info(`Contact message synced to Google Sheets, ID: ${contact._id}`);
    } catch (sheetErr) {
      logger.error(`Failed to sync contact message to Google Sheets:`, sheetErr);
      // Continue even if sheet sync fails
    }

    res.status(201).json({
      message: 'Contact message submitted successfully',
      id: contact._id
    });
  } catch (error) {
    logger.error('Contact submission error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

export const submitWailist = async(req, res) => {
  try{
    const { email } = req.body;
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email"})
      }
      const email_check = await Waitlist.findOne({ email })
      if (email_check) {
          return res.status(400).json({ message: "Email already in waitlist"})
      }
      const waitlist = await Waitlist.create({ email});
      // Write to Google Sheets (Contacts sheet)
    try {
      await appendRowToSheet(
        {
          email,
          submittedAt: new Date().toLocaleString(),
        },
        process.env.GOOGLE_WAITLIST_SHEET_NAME || 'Waitlist'
      );
      logger.info(`Waitlist entry synced to Google Sheets, ID: ${waitlist._id}`);
    } catch (sheetErr) {
      logger.error(`Failed to sync waitlist entry to Google Sheets:`, sheetErr);
      // Continue even if sheet sync fails
    }

      return res.status(201).json ({ message: "Email added to waitlist successfully", id: waitlist._id})
    } else {
      return res.status(400).json({ message: "Email is required"})
    }
  }
  catch (error) {
    logger.error('Waitlist submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }

}


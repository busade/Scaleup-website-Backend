import Contact from '../models/contact.js';
import Waitlist from '../models/waitlist.js';
import logger from '../utils/logger.js';
import validator from 'validator';
import { appendRowToSheet } from '../utils/googleSheets.js';
import { sendMail } from '../utils/email.js';
/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContact = async (req, res) => {
  try {
    // Check if request body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    const { name, email, subject, message } = req.body;
    console.log(name)
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
      console.log("Appending to Google Sheets:", { name, email, subject, message });
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

    // Send confirmation email
    try {
      await sendMail({
        to: email,
        subject: 'Thank you for contacting ScaleUp',
        text: `Hi ${name},\n\nThank you for reaching out to us. We have received your message regarding "${subject}" and will get back to you soon.\n\nYour message:\n${message}\n\nBest regards,\nScaleUp Team`,
        html: `<p>Hi ${name},</p><p>Thank you for reaching out to us. We have received your message regarding "${subject}" and will get back to you soon.</p><p><strong>Your message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p><p>Best regards,<br>ScaleUp Team</p>`
      });
      console.log(`Confirmation email sent to ${email}`);
      logger.info(`Confirmation email sent to ${email}`);
    } catch (emailErr) {
      logger.error(`Failed to send confirmation email to ${email}:`, emailErr);
      // Continue even if email fails
    }

    // Send notification email to ScaleUp
    try {
      await sendMail({
        to: process.env.SCALEUP_NOTIFICATION_EMAIL || 'scaleupbuild@gmail.com',
        subject: `New Contact Message: ${subject}`,
        text: `New contact message received:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSubmitted at: ${new Date().toLocaleString()}`,
        html: `<h2>New Contact Message</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p><p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>`
      });
      console
      logger.info(`Notification email sent to ScaleUp`);
    } catch (emailErr) {
      logger.error(`Failed to send notification email to ScaleUp:`, emailErr);
      // Continue even if email fails
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

export const submitWaitlist = async(req, res) => {
  try{
    // Check if request body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    console.log(req.body)
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


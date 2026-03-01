import Contact from '../models/contact.js';
import logger from '../utils/logger.js';
import validator from 'validator';
import { sendMail } from '../utils/email.js';

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

    // send notification email
    try {
      await sendMail({
        to: process.env.SMTP_USER,
        subject: `New contact message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`
      });
      logger.info('Notification email sent for contact message %s', contact._id);
    } catch (mailErr) {
      logger.error('Failed to send contact notification email: %o', mailErr);
    }

    res.status(201).json({
      message: 'Contact message submitted successfully',
      id: contact._id
    });
  } catch (error) {
    logger.error('Contact submission error: %o', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

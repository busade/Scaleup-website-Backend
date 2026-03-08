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

    // Send confirmation email to user
    try {
      await sendMail({
        to: email,
        subject: 'Thank you for contacting Scaleup',
        html: `
          <h2>Thank you, ${name}!</h2>
          <p>We've received your message and will get back to you soon.</p>
          <hr>
          <p><strong>Your message:</strong></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>Best regards,<br>Scaleup Team</p>
        `
      });
      logger.info(`Confirmation email sent to ${email} for contact message ${contact._id}`);
    } catch (mailErr) {
      logger.error(`Failed to send confirmation email to ${email}:`, mailErr);
      // Continue even if confirmation email fails
    }

    // Send notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL;
      if (adminEmail) {
        await sendMail({
          to: adminEmail,
          subject: `New Contact Message: ${subject}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><strong>Message ID:</strong> ${contact._id}</p>
            <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          `
        });
        logger.info(`Admin notification email sent for contact message ${contact._id}`);
      }
    } catch (mailErr) {
      logger.error(`Failed to send admin notification email:`, mailErr);
      // Continue even if admin email fails
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

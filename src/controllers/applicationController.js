import Volunteer from '../models/volunteer.js';
import logger from '../utils/logger.js';
import validator from 'validator';
import { appendRowToSheet } from '../utils/googleSheets.js';
import { sendMail } from '../utils/email.js';

/**
 * @desc    Submit a new volunteer application
 * @route   POST /api/applications
 * @access  Public
 */
export const submitApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      linkedIn,
      skills,
      availability,
      whyVolunteer,
      relevantExperience,
      cv
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({ message: 'Volunteer with this email already exists' });
    }

    const application = await Volunteer.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      linkedIn,
      skills,
      availability,
      whyVolunteer,
      relevantExperience,
      cv
    });

    logger.info(`New application received from ${email}. ID: ${application._id}`);
    // send email notification to scaleup team (non-blocking)
     try {
       await sendMail({
         to: process.env.SCALEUP_NOTIFICATION_EMAIL || "scaleupbuild@gmail.com",
         subject: 'New Volunteer Application Received',
         text: `A new volunteer application has been received:\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phoneNumber}\n\nSubmitted at: ${new Date().toLocaleString()}`,
          html: `<h2>New Volunteer Application</h2><p><strong>Name:</strong> ${firstName} ${lastName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phoneNumber}</p><p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>`
        });
        logger.info(`Notification email sent to ScaleUp for application ID: ${application._id}`);
      } catch (emailErr) {
        logger.error(`Failed to send notification email for application ID: ${application._id}:`, emailErr);
        // Continue even if email fails
      }
    // Sync to Google Sheets (Non-blocking)
    appendRowToSheet(req.body, process.env.GOOGLE_APPLICATIONS_SHEET_NAME || 'Applications');

    res.status(201).json({
      message: 'Application submitted successfully',
      id: application._id
    });
  } catch (error) {
    logger.error('Application submission error: %o', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  };
};


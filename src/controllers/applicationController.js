import Volunteer from '../models/volunteer.js';
import logger from '../utils/logger.js';
import validator from 'validator';
import { appendRowToSheet } from '../utils/googleSheets.js';

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
  }
};

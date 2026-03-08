import nodemailer from 'nodemailer';
import logger from './logger.js';
import { MailService } from '@sendgrid/mail';

let transporter;

const sendGridKey = process.env.SENDGRID_API_KEY;
if (sendGridKey) {
  const mailService = new MailService();
  mailService.setApiKey(sendGridKey);
  transporter = {
    sendMail: async (options) => {
      const msg = {
        to: options.to,
        from: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@scaleup.com',
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      try {
        await mailService.send(msg);
        logger.info(`Email sent successfully to ${options.to}`);
        return { success: true };
      } catch (error) {
        logger.error(`SendGrid error sending email to ${options.to}:`, error);
        throw error;
      }
    }
  };
  logger.info('Email service initialized with SendGrid');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  logger.info('Email service initialized with Nodemailer (SMTP fallback)');
}

/**
 * Send email using configured service (SendGrid or Nodemailer)
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @param {string} options.from - Sender email (optional, uses default if not provided)
 * @returns {Promise} Send result
 */
export const sendMail = async (options) => {
  try {
    if (!options.to || !options.subject) {
      throw new Error('Missing required fields: to and subject are required');
    }

    const result = await transporter.sendMail(options);
    return result;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}; 

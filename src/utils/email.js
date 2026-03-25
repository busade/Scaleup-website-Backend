import nodemailer from 'nodemailer';
import logger from './logger.js';
import { Resend } from 'resend';

let transporter;

const resendKey = process.env.RESEND_API_KEY;
if (resendKey) {
  const resend = new Resend(resendKey);
  transporter = {
    sendMail: async (options) => {
      const msg = {
        to: options.to,
        from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@mail.scaleupbuild.org',
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      try {
        await resend.emails.send(msg);
        logger.info(`Email sent successfully to ${options.to}`);
        return { success: true };
      } catch (error) {
        logger.error(`Resend error sending email to ${options.to}:`, error);
        throw error;
      }
    }
  };
  logger.info('Email service initialized with Resend');
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure:false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  logger.info('Email service initialized with Nodemailer (SMTP fallback)');
}

/**
 * Send email using configured service (Resend or Nodemailer)
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

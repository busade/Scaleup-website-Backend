import nodemailer from 'nodemailer';
import logger from './logger.js';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true'; // true if using TLS

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration missing');
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: {
      user,
      pass
    }
  });

  return transporter;
};

/**
 * @desc send an email
 * @param {{to:string,subject:string,text?:string,html?:string,from?:string}} options
 */
export const sendMail = async (options) => {
  const t = getTransporter();

  const mailOptions = {
    from: options.from || process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await t.sendMail(mailOptions);
  logger.info('Email sent: %s', info.messageId);
  return info;
};

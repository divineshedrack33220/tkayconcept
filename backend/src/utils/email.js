const nodemailer = require('nodemailer');

const isConfigured = process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'xxx';

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('Email skipped: SMTP not configured');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

module.exports = { sendEmail };

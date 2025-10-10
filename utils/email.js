// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendEmail = (to, subject, html) => {
  return transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, html });
};

module.exports = sendEmail;

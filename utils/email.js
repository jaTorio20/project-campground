// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587, // secure port
//   secure: false, // true for 465
//   auth: {
//     user: process.env.GMAIL_USER, // Gmail address
//     pass: process.env.GMAIL_PASS  // Gmail App Password
//   }
// });

// module.exports.sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: `"PinoyCampground" <${process.env.GMAIL_USER}>`,
//       to,
//       subject,
//       html
//     });
//     return true;
//   } catch (err) {
//     console.error("Email sending failed:", err);
//     return false;
//   }
// };

require('dotenv').config();
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

async function sendEmail({ to, subject, html }) {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: SENDER_EMAIL, name: 'PinoyCampground' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
      }
    );

    console.log('Email sent successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error);
    return false;
  }
}

module.exports = { sendEmail };



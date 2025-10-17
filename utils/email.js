// const axios = require('axios');

// /**
//  * Send an email via Brevo API
//  * @param {Object} options
//  * @param {string} options.to - Recipient email
//  * @param {string} options.subject - Email subject
//  * @param {string} options.html - HTML content
//  * @param {string} [options.from] - Sender email (default from env)
//  * @param {string} [options.fromName] - Sender name (default from env)
//  */
// async function sendEmail({ to, subject, html, from = process.env.BREVO_SENDER, fromName = process.env.BREVO_NAME }) {
//   try {
//     const res = await axios.post(
//       'https://api.brevo.com/v3/smtp/email',
//       {
//         sender: { name: fromName, email: from },
//         to: [{ email: to }],
//         subject,
//         htmlContent: html,
//       },
//       {
//         headers: {
//           'api-key': process.env.BREVO_API_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     console.log('Email sent:', res.data);
//     return true;
//   } catch (err) {
//     console.error('Error sending email:', err.response?.data || err.message);
//     return false;
//   }
// }

// module.exports = { sendEmail };

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // secure port
  secure: true, // true for 465
  auth: {
    user: process.env.GMAIL_USER, // Gmail address
    pass: process.env.GMAIL_PASS  // Gmail App Password
  }
});

module.exports.sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"PinoyCampground" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};


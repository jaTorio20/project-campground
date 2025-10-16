const axios = require('axios');

/**
 * Send an email via Brevo API
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.from] - Sender email (default from env)
 * @param {string} [options.fromName] - Sender name (default from env)
 */
async function sendEmail({ to, subject, html, from = process.env.BREVO_SENDER, fromName = process.env.BREVO_NAME }) {
  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: fromName, email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Email sent:', res.data);
    return true;
  } catch (err) {
    console.error('Error sending email:', err.response?.data || err.message);
    return false;
  }
}

module.exports = { sendEmail };

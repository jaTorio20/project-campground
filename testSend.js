require('dotenv').config();
const { sendEmail } = require('./utils/email');

(async () => {
  const success = await sendEmail({
    to: 'john2@gmail.com',
    subject: 'Test OTP Email',
    html: '<h1>Your OTP is: 123456</h1>',
  });

  console.log('Send status:', success ? 'Success' : 'Failed');
})();

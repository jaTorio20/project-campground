// seedAdmin.js
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}


const mongoose = require('mongoose');
const User = require('../models/user'); // adjust path if needed


mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/campground') //for production
// mongoose.connect('mongodb://localhost:27017/campground')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        username: 'ashleyAdmin', //5
        email: adminEmail,
        adminName,
        role: 'admin',
        name: process.env.ADMIN_NAME || 'Administrator',
        avatar: {
          url: '',
          filename: ''
        }
      });
      await User.register(admin, adminPassword);
      console.log('Admin account created');
    } else {
      console.log(' Admin already exists');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
};

seedAdmin();

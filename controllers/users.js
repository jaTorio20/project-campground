const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cloudinary = require('../cloudinary');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
}

//Send OTP for email verification
module.exports.sendOTP = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for duplicates
    if (await User.findOne({ username })) {
      req.flash('error', 'Username is already taken.');
      return res.redirect('/register');
    }
    if (await User.findOne({ email })) {
      req.flash('error', 'Email is already registered.');
      return res.redirect('/register');
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store data in session
    req.session.registerData = { username, email, password, otp, createdAt: Date.now() };

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PinoyCamp" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for PinoyCampground Registration',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });

    req.flash('success', 'OTP sent to your email. Please check.');
    return res.redirect('/verify-otp');

  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('/register');
  }
};


module.exports.renderOTPPage = (req, res) => {
  return res.render('users/verify-otp'); // EJS template
};

// STEP 2: Verify OTP and register user
module.exports.verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const registerData = req.session.registerData;

    if (!registerData) {
      req.flash('error', 'Session expired. Please register again.');
      return res.redirect('/register');
    }

    // Optional: expire OTP after 10 minutes
    if (Date.now() - registerData.createdAt > 10 * 60 * 1000) {
      req.flash('error', 'OTP expired. Please register again.');
      req.session.registerData = null;
      return res.redirect('/register');
    }

    if (otp !== registerData.otp) {
      req.flash('error', 'Invalid OTP. Please try again.');
      return res.redirect('/verify-otp');
    }

    // OTP valid - create user
    const { username, email, password } = registerData;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    // Log in user
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Registration successful!');
      return res.redirect('/campgrounds');
    });

    // Clear session
    req.session.registerData = null;

  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('/register');
  }
};


//############################### - FORGOT PASSWORD
module.exports.renderForgotPassword = (req, res) => {
  return res.render('users/forgot-password'); // create this EJS page
};

module.exports.sendResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'No account found with that email.');
      return res.redirect('/forgot-password');
    }

    // Generate token and set expiry (1 hour)
    const token = crypto.randomBytes(20).toString('hex');

    async function hashPassword(plainPassword) {
      const saltRounds = 10; 
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      return hashedPassword;
    }

    const hashedToken = await hashPassword(token);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    // const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    // const resetURL = `${protocol}://${req.headers.host}/reset-password/${user._id}/${token}`;
    const resetURL = `${process.env.BASE_URL}/reset-password/${user._id}/${token}`;


    await transporter.sendMail({
      to: user.email,
      from: process.env.GMAIL_USER,
      subject: 'Password Reset for PinoyCampground',
      text: `You are receiving this because you requested a password reset.\n\n
             Please click the following link, or paste it into your browser to complete the process:\n\n
             ${resetURL}\n\n
             This link will expire in 1 hour.\n\n
             If you did not request this, please ignore this email.\n`
    });

    req.flash('success', 'Password reset email sent. Please check your inbox.');
    return res.redirect('/login');

  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('/forgot-password');
  }
};

//############################### - RESET PASSWORD
module.exports.renderResetForm = async (req, res) => {
  const { id, token } = req.params;

  const user = await User.findById(req.params.id);
  const match  = await bcrypt.compare(token, user.resetPasswordToken);
  
  if (!match) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot-password');
  }

  return res.render('users/reset-password', { id, token });
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { token} = req.params;
    const { password } = req.body;

    const user = await User.findById(req.params.id);
    const match  = await bcrypt.compare(token, user.resetPasswordToken);

    if (!match) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot-password');
    }

    // Update password using passport-local-mongoose method
    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.login(user, err => {
      if (err) return next(err);
      req.flash('success', 'Password has been reset. You are now logged in!');
      return res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('/forgot-password');
  }
};


module.exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  handler: (req, res) => {
    req.flash('error', 'Too many login attempts. Please try again after 15 minutes.');
    return res.redirect('/login');
  }
});

module.exports.renderLogin = (req, res) => {
  return res.render('users/login');
};



module.exports.login = (req, res) => {
  req.flash('success', 'Welcomeback!');
  const redirectUrl = res.locals.returnTo || '/campgrounds'; //
  // delete req.session.returnTo;
  return res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
  req.logout(function (err){
    if(err){
      return next(err);
    }
    req.flash('success', 'Goodbye!')
    return res.redirect('/campgrounds');
  });
}

// --- GOOGLE LOGIN SUCCESS ---
module.exports.googleLogin = (req, res) => {
  req.flash('success', `Welcome back, ${req.user.name || 'User'}!`);
  return res.redirect('/campgrounds');
};



// ---AVATAR IMAGES
module.exports.uploadAvatar = async (req, res) => {

    const user = await User.findById(req.user._id);

    if (!req.file) {
      req.flash('error', 'No image uploaded');
      return res.redirect('/campgrounds');
    }

    // If user already has an avatar, delete it from Cloudinary first
    if (user.avatar && user.avatar.filename) {
      await cloudinary.uploader.destroy(user.avatar.filename);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'PinoyCampground/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { radius: 20 }
      ]
    });

    // Save new avatar info
    user.avatar = { url: result.secure_url, filename: result.public_id };
    await user.save();

    // Delete temporary local file
    await fs.promises.unlink(req.file.path);

    req.flash('success', 'Profile picture updated!');
    return res.redirect('/campgrounds');

};

module.exports.deleteAvatar = async (req, res) => {

    const user = await User.findById(req.user._id);

    // if there's a Cloudinary avatar inside "PinoyCampground/avatars" delete
    if (
      user.avatar &&
      user.avatar.filename && 
      user.avatar.filename.startsWith('PinoyCampground/avatars/')
    ) {
        await cloudinary.uploader.destroy(user.avatar.filename);
        if(process.env.NODE_ENV !== 'production'){
        console.log(` Deleted Cloudinary image: ${user.avatar.filename}`);
          }

    }

    // Reset the user's avatar data
    user.avatar = { url: '', filename: '' };
    await user.save();

    req.flash('success', 'Profile picture removed');
    return res.redirect('/campgrounds');

};


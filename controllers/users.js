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

    // // Send email
    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.gmail.com',
    //   port: 587,        // TLS
    //   secure: false,    // true for SSL (465), false for TLS (587)
    //   auth: {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.GMAIL_PASS,
    //   },
    // });
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',  
      port: 587,                    
      secure: false,            
      auth: {
        user: process.env.BREVO_USER, 
        pass: process.env.BREVO_PASS, 
      },
    });

    await transporter.sendMail({
  from: `"PinoyCampground Support" <johntorio2422@gmail.com>`,
  to: email,
  subject: 'Your OTP Code for PinoyCampground Registration',
  html: `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f6f8;
    padding: 30px;
    color: #333;
  ">
    <div style="
      max-width: 500px;
      margin: auto;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      padding: 25px;
    ">
      <h2 style="color: #2b7a78; text-align: center; margin-bottom: 10px;">
        PinoyCampground
      </h2>
      <p style="text-align: center; font-size: 15px; color: #555;">
        Hello! Here’s your One-Time Password (OTP) to complete your registration:
      </p>

      <div style="
        background-color: #def2f1;
        color: #17252a;
        text-align: center;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 4px;
        border-radius: 8px;
        padding: 12px 0;
        margin: 25px auto;
        width: fit-content;
      ">
        ${otp}
      </div>

      <p style="text-align: center; color: #555; font-size: 14px;">
        This OTP is valid for <strong>10 minutes</strong>.<br>
        If you didn’t request this, please ignore this email.
      </p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;">

      <p style="text-align: center; font-size: 12px; color: #888;">
        &copy; ${new Date().getFullYear()} PinoyCampground. All rights reserved.<br>
        <a href="https://pinoycampground.onrender.com" 
           style="color: #2b7a78; text-decoration: none;">Visit Website</a>
      </p>
    </div>
  </div>
  `,
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
      host: 'smtp-relay.brevo.com',
      port: 587,                   
      secure: false,             
      auth: {
        user: process.env.BREVO_USER, 
        pass: process.env.BREVO_PASS, 
      },
    });

    // const resetURL = `http://${req.headers.host}/reset-password/${user._id}/${token}`;
        // const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    // const resetURL = `${protocol}://${req.headers.host}/reset-password/${user._id}/${token}`;
    // console.log('BASE_URL:', process.env.BASE_URL);
    const resetURL = `${process.env.BASE_URL}/reset-password/${user._id}/${token}`;

    await transporter.sendMail({
    to: user.email,
    from: `"PinoyCampground" <johntorio2422@gmail.com>`,
    subject: 'Reset Your PinoyCampground Password',
    html: `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f8fafc; padding: 40px;">
      <div style="
        max-width: 440px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 35px 30px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        text-align: center;
      ">
        <h2 style="color: #2e7d32; margin-bottom: 20px; font-size: 24px;">PinoyCampground</h2>
        
        <p style="color: #444; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
          We received a request to reset your password.  
          Click the button below to create a new one:
        </p>
        
        <a href="${resetURL}" style="
          display: inline-block;
          background: #2e7d32;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
        ">Reset Password</a>
        
        <p style="color: #666; 
        margin-top: 30px; 
        font-size: 13px; 
        line-height: 1.5;">
          This link will expire in <strong>1 hour</strong>.<br>
          If you didn’t request this, please ignore this email.
        </p>
      </div>
    </div>
  `,
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


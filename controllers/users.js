const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
      return res.redirect('/login');
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
    user.resetPasswordToken = token;
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

    const resetURL = `http://${req.headers.host}/reset-password/${token}`;

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
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // token not expired
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot-password');
  }

  return res.render('users/reset-password', { token }); // create EJS template
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
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


// module.exports.register = async(req, res, next) => {
//   try{
//   const {username, email, password} = req.body;

//   const existingUsername = await User.findOne({ username });
//     if (existingUsername) {
//       req.flash('error', 'Username is already taken. Please choose another one.');
//       return res.redirect('/register');
//     }

//     // Check if email already exists
//     const existingEmail = await User.findOne({ email });
//     if (existingEmail) {
//       req.flash('error', 'Email is already registered. Please log in instead.');
//       return res.redirect('/login');
//     }

//   const user = new User({
//     username,
//     email
//   });
//   const registeredUser = await User.register(user, password);
//   req.login(registeredUser, err => {
//     if(err) return next(err);
//     req.flash('success', 'Welcome to Campground!');
//     res.redirect('/campgrounds');
//   });
//   }catch(e){  
//   if (e.code === 11000) {
//     req.flash('error', 'That username or email is already in use.');
//     return res.redirect('/register');
//   }

//     req.flash('error', e.message); //Libraries like Mongoose, Passport, etc., throw errors that extend Error and include .message.
//     res.redirect('register');
//   }
// }

module.exports.renderLogin = (req, res) => {
  return res.render('users/login');
}

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
const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');
const {isAuthor, isLoggedIn} = require('../middleware')
const upload = require('../middleware/upload');

// router.route('/register')
// .get( users.renderRegister)
// .post( catchAsync(users.register))

// User registration
router.get('/register', users.renderRegister); 
router.post('/register', catchAsync(users.sendOTP));

// Send OTP for email verification
router.get('/verify-otp', users.renderOTPPage);          // show OTP form
router.post('/verify-otp', catchAsync(users.verifyOTP)); 

// Forgot password
router.get('/forgot-password', users.renderForgotPassword);
router.post('/forgot-password', catchAsync(users.sendResetEmail));

// Reset password
router.get('/reset-password/:token', users.renderResetForm);
router.post('/reset-password/:token', catchAsync(users.resetPassword));


router.route('/login')
.get(users.renderLogin)
.post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout);


// --- GOOGLE AUTH ---
//Start Google OAuth
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

//Handle callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  users.googleLogin // handled by controller
);


// ----- AVATAR IMAGES-----
router.post('/avatar', isLoggedIn, upload.single('avatar'), catchAsync(users.uploadAvatar));
router.delete('/avatar', isLoggedIn, catchAsync(users.deleteAvatar));

module.exports = router;

// router.get('/register', users.renderRegister);

// router.post('/register', catchAsync(users.register));

// router.get('/login', users.renderLogin);

// router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

// router.get('/logout', users.logout);
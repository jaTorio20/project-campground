// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

// Local Strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate())); 
const callbackURL =
  process.env.NODE_ENV === 'production'
    ? "https://pinoycampground.onrender.com/auth/google/callback"
    : "http://localhost:3000/auth/google/callback";

// --- Google Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Step 1: Check if the user already logged in with Google before
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Step 2: Check if there’s an existing local account with the same email
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.name = user.name || profile.displayName;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            await user.save();
            return done(null, user);
          }
        }

        // STEP 3: Auto-generate a unique username for new Google user
        const baseUsername = profile.displayName
          ? profile.displayName.replace(/\s+/g, '')
          : email.split('@')[0]; // fallback to email prefix if no displayName
        
        let username = baseUsername;
        let count = 1;

        // Loop until username is unique
        while (await User.findOne({ username })) {
          username = `${baseUsername}${count++}`;
        }

        // Step 4: Otherwise, create a completely new Google user
        const newUser = await User.create({
          googleId: profile.id,
          username,
          name: profile.displayName,
          email: email,
            avatar: {
              url: profile.photos?.[0]?.value || '/images/placeholder.jpg',
              filename: `google-${profile.id}`, //pseudo filename for Google photo
            },
        });

        return done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // save only the user’s MongoDB _id in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // attaches full user object (including avatar) to req.user
  } catch (err) {
    done(err, null);
  }
});


module.exports = passport;

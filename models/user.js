// npm i passport passport-local passport-local-mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  
  username: {
    type: String,
    required: true,
    unique: true //keep this if usernames must be unique per user
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
    googleId: {
    type: String,
    unique: true,
    sparse: true // allows multiple nulls (not all users have Google)
  },
  name: String,
  avatar: {
  url: String,
  filename: String
},

  // For password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', UserSchema);
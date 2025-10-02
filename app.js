const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/yelp-camp');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = { //useful as it sets session for flash to make it work
  secret: 'supposetobesecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() +  1000 * 60 * 60 * 24 * 5, //expires after 5 days
    maxAge: 1000 * 60 * 60 * 24 * 5
  }
}
app.use(session(sessionConfig)); //make sure this session should be first then followed by passport.session
app.use(flash());//for flash

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //call the User model then authenticate

passport.serializeUser(User.serializeUser()); //store user in the session
passport.deserializeUser(User.deserializeUser()); //Unstore user in the session

app.use((req, res, next) => { //this passing up the value from routes to ejs file
  // console.log(req.session);
  res.locals.currentUser = req.user; //to add logic for login/register and logout if log in already
  res.locals.success = req.flash('success');//in ejs file should <%= success %> u're accessing it into ejs
  res.locals.error = req.flash('error');
  next();
});

// app.get('/staticUser', async(req, res) => { //no need to hash, automatically set for when using passport
//   const user = new User ({email: 'john@gmail.com', username: 'johnashley'});
//   const newUser = await User.register(user, 'johnashley');
//   res.send(newUser);
// })

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});



app.all(/(.*)/, (req, res, next) => {
   next(new ExpressError('Page not found', 404));
});


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(statusCode).render('error', {err});
});

app.listen(3000, async (req, res) => {
  console.log('LISTENING TO PORT 3000');
});
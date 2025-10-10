if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}


  // require('dotenv').config();
// console.log(process.env.SECRET);
// console.log(process.env.API_KEY);
const sanitizeV5 = require('./utils/mongoSanitizeV5.js'); //
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('./config/passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const cron = require('node-cron');
const fs = require('fs');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

mongoose.connect('mongodb://localhost:27017/campground'); //turn this on for local connection

// const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/campground'; //turn off for going to local connection
// mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('query parser', 'extended'); //

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(sanitizeV5({ replaceWith: '_' })); //

// const secret = process.env.SECRET || 'supposetobesecret!';

// const store = MongoStore.create({
//     mongoUrl: dbURL,
//     touchAfter: 24 * 60 * 60, //only update once per day
//     crypto: {
//         secret: 'supposetobesecret!'
//     }
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

// const sessionConfig = {
//     store,
//     name: 'session',
//     secret,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         // secure: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }


//default store is memory store
const sessionConfig = { //useful as it sets session for flash to make it work
  name: 'session', //renaming the session id
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, //enable this in production
    expires: Date.now() +  1000 * 60 * 60 * 24 * 5, //expires after 5 days
    maxAge: 1000 * 60 * 60 * 24 * 5
  }
}
app.use(session(sessionConfig)); //make sure this session should be first then followed by passport.session
app.use(flash());//for flash
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dr8nraigy/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize()); 
app.use(passport.session());

app.use((req, res, next) => { //this passing up the value from routes to ejs file
  // console.log(req.session);
  console.log(req.query);
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


const tempDir = path.join(process.cwd(), 'temp');

// Auto-cleanup cron (runs every 6 hours) - 
cron.schedule('0 */6 * * *', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(' Running cleanup job...');
  }
  fs.readdir(tempDir, (err, files) => {
    if (err) return console.error('Error reading temp folder:', err);

    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        // Delete files older than 1 hour 1000 * 60 * 60
        if ((now - stats.mtimeMs) > 1000 * 60 * 60) {
          fs.unlink(filePath, err => {
            if (!err && process.env.NODE_ENV !== 'production') console.log(` Deleted old file: ${file}`);
          });
        }
      });
    });
  });
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
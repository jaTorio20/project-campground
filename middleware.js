const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {//automatically put the req.user for us    
  if(!req.isAuthenticated()) {//req.isAuthenticated Passport built in function
    req.session.returnTo = req.originalUrl; //tracing the path where the user is not log in, if they log in they will
    req.flash('error', 'You must be signed in first!'); //auto go to the last path they clicked in.
    return res.redirect('/login');
  }
  next();
}

module.exports.storeReturnTo = (req, res, next) => { // still required to track path if it's not login
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else{
    next();
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash('error', "You don't have permission");
    return res.redirect(`/campgrounds/${id}`);
  } 
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  console.log('Review ID:', reviewId);
console.log('Fetched Review:', review);
  // if (!review) {
  //   req.flash('error', 'Review not found');
  //   return res.redirect(`/campgrounds/${id}`);
  // }
  if(!review.author.equals(req.user._id)){
    req.flash('error', "You don't have permission");
    return res.redirect(`/campgrounds/${id}`);
  } 
    next();
}

module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else{
    next();
  }
}
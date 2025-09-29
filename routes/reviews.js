const express = require('express');
const router = express.Router( {mergeParams: true} ); //so that in app.js and this file can access the route and its ID
const Campground = require('../models/campground');
const Review = require('../models/review');

const {reviewSchema} = require('../schemas');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else{
    next();
  }
}

router.post('/', validateReview, catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
    req.flash('success', 'Successfully created campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});//removing campground.reviews arrays contains in that review model
  await Review.findByIdAndDelete(reviewId);//if Review was removed then id associated with
  req.flash('success', 'Review Deleted successfully!');
  res.redirect(`/campgrounds/${id}`); //Campground.reviews will be removed, as well
}));

module.exports = router;
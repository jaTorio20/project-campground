const express = require('express');
const router = express.Router( {mergeParams: true} ); //so that in app.js and this file can access the route and its ID
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
// const {reviewSchema} = require('../schemas');
const catchAsync = require('../utils/catchAsync');
// const ExpressError = require('../utils/ExpressError');



router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
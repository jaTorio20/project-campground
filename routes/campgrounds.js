const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// const Campground = require('../models/campground');
// const Review = require('./models/review');
const campgrounds = require('../controllers/campgrounds');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const multer  = require('multer');
const {storage} = require('../cloudinary');//automatically look for index.js file in cloudinary folder
const upload = multer({ storage});
// const upload = multer({ dest: 'uploads/' }); //dest meaning destination local folder only

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
  // .post(upload.array('image'), (req, res) => {//upload.single can upload one file, upload.array can do multiple file
  //   console.log(req.body, req.files); //req.file for single file, req.files multiple file
  //   res.send("IT'S WORKING");
  // });

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;

// router.get('/', catchAsync(campgrounds.index));

// router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// router.get('/:id', catchAsync(campgrounds.showCampground));

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
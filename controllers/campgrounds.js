const Campground = require('../models/campground');
const cloudinary = require('../cloudinary'); //this is from deleting in cloudinary
const fs = require('fs');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder =  mbxGeocoding({ accessToken: mapBoxToken});

// module.exports.index =  async(req, res) => {
//   const campgrounds = await Campground.find({});
//   res.render('campgrounds/index', {campgrounds})
// }
module.exports.index =  async(req, res) => {
  const limit = 15;
  const page = parseInt(req.query.page) || 1;

  const campgrounds = await Campground.find({}).populate('author', 'username avatar')
    .skip((page - 1) * limit)
    .limit(limit);

  // If AJAX, return JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.json(campgrounds);
  }

  // Initial full page render
  return res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    return res.render('campgrounds/new');
}


module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground);

  const imgs = [];

  for (let file of req.files) {
      try{
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'PinoyCampground',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
          { width: 800, height: 800, crop: 'limit' }
        ]       
      });
      imgs.push({ url: result.secure_url, filename: result.public_id });
    } catch(err){
      if (process.env.NODE_ENV !== 'production') {
        console.error('Cloudinary upload failed:', err);
      }
    } finally {
      try{
        await fs.promises.unlink(file.path); // cleanup temp file
      }catch{
        if (process.env.NODE_ENV !== 'production') {
        console.error('Async delete failed:', err);
        }
      }
    }
  }

 
    if (req.files.length > 0 && imgs.length === 0) {
      req.flash('error', 'Image upload failed. Please check your connection and try again.');
      return res.redirect('/campgrounds/new');
    }

    if (imgs.length === 0) {
      req.flash('error', 'Image upload failed. Please upload an image.');
      return res.redirect('/campgrounds/new');
    }

  campground.geometry = geoData.body.features[0].geometry;
  campground.images = imgs;
  campground.author = req.user._id;
  await campground.save();
  // console.log(campground);
  req.flash('success', 'Successfully made a new campground!');
  return res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  .populate({
    path: 'reviews', //set path if planning to populate data inside of reviews
    populate: { //under reviews>author it populates the item of author
      path: 'author'
    }
  })
  .populate('author');
  // console.log(campground);
  if(!campground){
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
    }
  return res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
    if(!campground){
    req.flash('error', 'Cannot find campground');
    return res.redirect('/campgrounds');
    } 
  return res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

  const imgs = [];
  for (let file of req.files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'PinoyCampground',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { radius: 20 }
      ]
    });
    imgs.push({ url: result.secure_url, filename: result.public_id });
    fs.unlinkSync(file.path); // cleanup temp file
  }

  campground.images.push(...imgs);
  await campground.save();

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } }
    });
  }

  req.flash('success', 'Successfully updated campground!');
  return res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Campground Deleted successfully!');
  return res.redirect('/campgrounds');
}


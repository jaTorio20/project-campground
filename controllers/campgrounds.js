const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary'); //this is from deleting in cloudinary

module.exports.index =  async(req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
  // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
  const campground = new Campground(req.body.campground);
  campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
  campground.author = req.user._id; //req.user automatically added in 
  await campground.save();
  // console.log(campground);
  req.flash('success', 'Successfully made a new campground!');
  res.redirect(`/campgrounds/${campground._id}`) //
}

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate({
    path: 'reviews', //set path if planning to populate data inside of reviews
    populate: { //under reviews>author it populates the item of author
      path: 'author'
    }
  }).populate('author');
  // console.log(campground);
  if(!campground){
    req.flash('error', 'Cannot find campground');
    res.redirect('/campgrounds');
    }
  res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
    if(!campground){
    req.flash('error', 'Cannot find campground');
    res.redirect('/campgrounds');
    } 
  res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
  campground.images.push(...imgs);
  await campground.save();
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages){ //deleting in cloudinary as well
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
  } //pull from the images array all images in filename is in req.body.deleteImages
  req.flash('success', 'Successfully updated campground!');
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted successfully!');
  res.redirect('/campgrounds');
}
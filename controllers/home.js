const Campground = require('../models/campground');
module.exports.homeRender = async (req, res) => {
  const campgrounds = await Campground.find().limit(6);
  res.render('home', { campgrounds });
};

    const Joi = require('joi');

    //reason that there is campground: Joi.object because in html form
    //there is wrap like this
    //<input class="form-control" type="text" id="location" name="campground[location]" required>
  module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({ 
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      // image: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),

    }).required(),
      deleteImages: Joi.array()
  });

  module.exports.reviewSchema = Joi.object({
    review: Joi.object({
      rating: Joi.number().required().min(1).max(5),
      body: Joi.string().required()
    }).required()
  });
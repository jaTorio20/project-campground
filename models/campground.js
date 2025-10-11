const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


//https://res.cloudinary.com/demo/image/upload/leather_bag_gray.jpg
const ImageSchema = new Schema({   
    url: String,
    filename: String 
});

ImageSchema.virtual('thumbnail').get(function(){
  return this.url.replace('/upload', '/upload/w_100');
});

const opts = {toJSON: {virtuals: true}};//for allowing the toJSON to true in virtual

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId, 
      ref: 'Review'
    }
  ],
  createdAt: { type: Date, default: Date.now }
}, opts);

//no need to write campground.title because it's already inside the documents text
//of campground schema
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
  return `
   <div class="mapbox-popup">
    <strong> <a href="/campgrounds/${this._id}">${this.title}</a> </strong>
    <p>${this.description.substring(0, 20)}...</p> 
  </div>
  ` //truncate (.substring), allowed characters
  // 0 - 20 characters only
});

CampgroundSchema.post('findOneAndDelete', async function(doc){
  if(doc){
    await Review.deleteMany({ //deleteMany, deleteOne, findByIdAndDelete this
      _id: { //are methods works for mongoose. remove() is deprecated
        $in: doc.reviews
      }
    })
  }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('@fluidjs/multer-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params:{
  folder: 'PinoyCampground',
  allowed_formats: ['jpg', 'jpeg', 'png'],
  transformation: [{ width: 800, height: 800, crop: 'limit' }, {radius: 20}],
  },
});

module.exports = {
  cloudinary,
  storage 
}
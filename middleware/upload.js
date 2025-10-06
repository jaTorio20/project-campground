const multer = require('multer');//Middleware for handling multipart/form-data (used for file uploads)
const path = require('path');
const fs = require('fs');

const tempDir = 'temp/';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'temp/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); //path.extname it extract file extension like .jpg
    const name = `${Date.now()}-${file.fieldname}${ext}`; //getting the name of form field
    cb(null, name); //cb = callback inside are the arguments passed they followed the error first and second is result

  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']; //built-in image/
  cb(null, allowed.includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter });

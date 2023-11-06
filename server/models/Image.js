const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String, // Name of the image file
  data: Buffer, // Binary image data
  contentType: String, // MIME type of the image
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
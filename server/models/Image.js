const mongoose = require('mongoose');

const { Schema } = mongoose;

const ImageSchema = new Schema({
    originalFilename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', ImageSchema);
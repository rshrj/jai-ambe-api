const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  uploadSettingType: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('uploads', UploadSchema);

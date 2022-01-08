const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: String
  },
  phone: {
    type: String
  },
  message: {
    type: String,
    required: true,
    minLength: 100
  },
  show: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
});

module.exports = mongoose.model('testimonials', TestimonialSchema);

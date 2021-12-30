const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },


  active: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('properties', PropertySchema);

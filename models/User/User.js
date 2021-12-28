const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { CUSTOMER, ADMIN } = require('./roles');

//below schema should also contain mobile no.

const UserSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      trim: true,
      required: true
    },
    last: {
      type: String,
      trim: true,
      required: true
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: [CUSTOMER, ADMIN],
    required: true
  },
  verificationToken: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.JWTSECRET
  );
  return token;
};

module.exports = mongoose.model('users', UserSchema);

const validator = require("validator");
const mongoose = require("mongoose");

const checkSignup = (email, { first, last }, password, password2) => {
  return (
    !validator.isEmpty(email) &&
    validator.isEmail(email) &&
    !validator.isEmpty(first) &&
    !validator.isEmpty(last) &&
    validator.isLength(password, { min: 8 }) &&
    validator.isLength(password2, { min: 8 }) &&
    validator.equals(password, password2)
  );
};

const checkUpdate = (userId, email, first, last, password) => {
  return (
    mongoose.isValidObjectId(userId) &&
    !validator.isEmpty(email) &&
    validator.isEmail(email) &&
    !validator.isEmpty(first) &&
    !validator.isEmpty(last) &&
    validator.isLength(password, { min: 8 })
  );
};

module.exports = { checkSignup, checkUpdate };

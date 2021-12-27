const validator = require('validator');

module.exports.checkLogin = (email, password) => {
  return (
    validator.isEmail(email + '') && validator.isLength(password, { min: 8 })
  );
};

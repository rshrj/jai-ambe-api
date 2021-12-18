const validator = require("validator");

module.exports.checkLogin = (email, password) => {
  return (
    !validator.isEmpty(email) &&
    validator.isEmail(email) &&
    validator.isLength(password, { min: 8 })
  );
};

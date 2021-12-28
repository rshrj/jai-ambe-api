const Joi = require("joi");

module.exports.checkLogin = Joi.object({
  email: Joi.string().trim().email().required().label("Email"),
  password: Joi.string().trim().min(8).required().label("Password"),
});

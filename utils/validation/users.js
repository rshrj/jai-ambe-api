const Joi = require("joi");

const checkUser = Joi.object({
  email: Joi.string().trim().email().required().label("Email"),
  name: Joi.object({
    first: Joi.string().trim().required().label("First Name"),
    last: Joi.string().trim().required().label("Last Name"),
  }),
  password: Joi.string().trim().min(8).required().label("Password"),
  password2: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password"),
});

const checkUserUpdate = Joi.object({
  email: Joi.string().trim().email().required().label("Email"),
  name: Joi.object({
    first: Joi.string().trim().required().label("First Name"),
    last: Joi.string().trim().required().label("Last Name"),
  }),
  password: Joi.string().trim().min(8).required().label("Password"),
});



module.exports = { checkUserUpdate, checkUser };

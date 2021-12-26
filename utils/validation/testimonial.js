const Joi = require("joi");

module.exports.checkTestimonial = Joi.object({
  name: Joi.string().min(5).required(),
  company: Joi.string().min(4).required(),
  image: Joi.string(),
  mobile: Joi.string().length(10),
  testimonial: Joi.string().min(100).required(),
  show: Joi.boolean(),
});

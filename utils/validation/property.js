const Joi = require("joi");

module.exports.checkProperty = Joi.object({
  lookingTo: Joi.string().required(),
  propertyType: Joi.string().required(),
  propertyCategory: Joi.string().required(),
  location: Joi.object({
    address: Joi.string().required(),
    district: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.number().required(),
  }),
  details: Joi.object({
    bedrooms: Joi.number().required(),
    bathrooms: Joi.number().required(),
    balconies: Joi.number().required(),
  }),
  area: Joi.object({
    carpetArea: Joi.string().required(),
    carpetAreaUnit: Joi.string().required(),
    builtupArea: Joi.string(),
    builtupAreaUnit: Joi.string(),
  }),
  otherRooms: Joi.string(),
  furnishing: Joi.string(),
  coveredParking: Joi.number().required(),
  openParking: Joi.number().required(),
  totalFloor: Joi.number().required(),
  floorNo: Joi.number().required(),
  status: Joi.string().required(),
  propertyYear: Joi.number().required(),
  price: Joi.number().required(),
  otherPricing: Joi.object({
    maintenanceType: Joi.string(),
    maintenance: Joi.number(),
    expectedRent: Joi.number(),
    bookingAmount: Joi.number(),
    membershipCharge: Joi.number(),
  }),
});

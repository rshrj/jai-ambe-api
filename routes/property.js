const router = require("express").Router();
const mongoose = require("mongoose");

const Property = require("../models/Property/Property");
const { checkProperty } = require("../utils/validation/property");
const { CUSTOMER, ADMIN } = require("../models/User/roles");
const auth = require("../utils/auth/index");
const checkError = require("../utils/error/checkError");

/*
  Property body
    {
       lookingTo,
      propertyType,
      propertyCategory,
      location: { address, district, state, pincode },
      details: { bedrooms, bathrooms, balconies },
      area: { carpetArea, carpetAreaUnit, builtupArea, builtupAreaUnit },
      otherRooms,
      furnishing,
      coveredParking,
      openParking,
      totalFloor,
      floorNo,
      status,
      propertyYear,
      price,
      otherPricing: {
        maintenanceType,
        maintenance,
        expectedRent,
        bookingAmount,
        membershipCharge,
      },
    }
*/

// @route   POST property/all
// @desc    ADMIN =>  Can provide userId to fetch all properties of a user. body => { propertyId }
//          CUSTOMER => Can fetch his/her all properties.
// @access  CUSTOMER, ADMIN
router.post("/all", auth(CUSTOMER, ADMIN), async (req, res) => {
  const {
    user,
    body: { userId },
  } = req;

  try {
    let properties = [];

    if (user.role == ADMIN) {
      if (!mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .json({
            success: false,
            errors: { userId: "Invalid userId provided." },
          });
      }

      properties = await Property.find({ userId: userId });
    } else {
      properties = await Property.find({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      payload: properties,
      message: "Properties data fetched successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ["Server error occurred"] }
    });
  }
});


// @route   POST property/one
// @desc    ADMIN =>  Can provide propertyId to fetch all details of that property.
//          CUSTOMER => Can provide propertyId & fetch all details of that property(Own).
//          body => { propertyId }
// @access  CUSTOMER, ADMIN
router.post("/one", auth(CUSTOMER, ADMIN), async (req, res) => {
  const {
    user,
    body: { propertyId },
  } = req;

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, errors: {propertyId : 'Invalid propertyId provided.'} });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        errors: { toasts: ["Property with the given propertyId was not found."] },
      });
    }

    if (
      user.role == ADMIN ||
      (user.role == CUSTOMER &&
        property.userId.toString() == user._id.toString())
    ) {
      return res.status(200).json({
        success: true,
        payload: property,
        message: "Property details found successfully.",
      });
    } else {
      return res.status(403).json({
        success: false,
        errors: { toasts: ["You are not authorized to perform this action."] },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ["Server error occurred"] }
    });
  }
});


/*
 @route   POST property/create
 @desc    Add new property
          body => {
                      lookingTo,
                      propertyType,
                      propertyCategory,
                      location: { address, district, state, pincode },
                      details: { bedrooms, bathrooms, balconies },
                      area: { carpetArea, carpetAreaUnit, builtupArea, builtupAreaUnit },
                      otherRooms,
                      furnishing,
                      coveredParking,
                      openParking,
                      totalFloor,
                      floorNo,
                      status,
                      propertyYear,
                      price,
                      otherPricing: {
                        maintenanceType,
                        maintenance,
                        expectedRent,
                        bookingAmount,
                        membershipCharge,
                      },
                   }
 @access  CUSTOMER, ADMIN
*/
router.post("/create", auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;

  const { error, value } = checkError(checkProperty, {
    ...body
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    const property = new Property({ ...body, userId: user._id });

    await property.save();

    return res.status(201).json({
      success: true,
      payload: property,
      message: "Property added successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ["Server error occurred"] }
    });
  }
});


/*
 @route   PUT property/update
 @desc    To update a existing property
          body => {
                      lookingTo,
                      propertyType,
                      propertyCategory,
                      location: { address, district, state, pincode },
                      details: { bedrooms, bathrooms, balconies },
                      area: { carpetArea, carpetAreaUnit, builtupArea, builtupAreaUnit },
                      otherRooms,
                      furnishing,
                      coveredParking,
                      openParking,
                      totalFloor,
                      floorNo,
                      status,
                      propertyYear,
                      price,
                      otherPricing: {
                        maintenanceType,
                        maintenance,
                        expectedRent,
                        bookingAmount,
                        membershipCharge,
                      },
                   }
 @access  CUSTOMER, ADMIN
*/
router.put("/update", auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;
  const { propertyId, ...updates } = body;

  const { error, value } = checkError(checkProperty, {
    ...updates,
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, errors: {propertyId : 'Invalid propertyId provided.'} });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        errors: { toasts: ["Property with the given propertyId was not found."] },
      });
    }

    if (
      user.role == ADMIN ||
      (user.role == CUSTOMER &&
        property.userId.toString() == user._id.toString())
    ) {
      property = await Property.findByIdAndUpdate(
        propertyId,
        { ...value },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        payload: property,
        message: "Property has been updated successfully.",
      });
    } else {
      return res.status(403).json({
        success: false,
        errors: { toasts: ["You are not authorized to perform this action."] },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ["Server error occurred"] }
    });
  }
});


// @route   DELETE property/delete
// @desc    To delete a existing property
//          body : { propertyId }
// @access  CUSTOMER, ADMIN
router.delete("/delete", auth(ADMIN, CUSTOMER), async (req, res) => {
  const {
    body: { propertyId },
    user,
  } = req;

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, errors: {propertyId : 'Invalid propertyId provided.'} });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        errors: { toasts: ["Property with the given propertyId was not found."] },
      });
    }

    if (
      user.role == ADMIN ||
      (user.role == CUSTOMER &&
        property.userId.toString() == user._id.toString())
    ) {
      property = await Property.findByIdAndDelete(propertyId);

      return res.status(200).json({
        success: true,
        payload: property,
        message: "Property has been deleted successfully.",
      });
    } else {
      return res.status(403).json({
        success: false,
        errors: { toasts: ["You are not authorized to perform this action."] },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ["Server error occurred"] }
    });
  }
});


// @route   PUT property/active
// @desc    To change a existing property status to active or inactive
//          body : { propertyId, active }
// @access  CUSTOMER, ADMIN
router.put("/active", auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;
  const { propertyId, active } = body;

  if (![true, false].includes(active)) {
    return res.status(400).json({
      success: false,
      errors: { toasts: ["Active attribute is missing in request body."] }
    });
  }

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, errors: {propertyId : 'Invalid propertyId provided.'} });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        errors: { toasts: ["Property with the given propertyId was not found."] },
      });
    }

    if (
      user.role == ADMIN ||
      (user.role == CUSTOMER &&
        property.userId.toString() == user._id.toString())
    ) {
      property = await Property.findByIdAndUpdate(
        propertyId,
        { active: active },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        payload: property,
        message: "Property status has been changed successfully.",
      });
    } else {
      return res.status(403).json({
        success: false,
        errors: { toasts: ["You are not authorized to perform this action."] },
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ["Server error occurred"] }
    });
  }
});

module.exports = router;

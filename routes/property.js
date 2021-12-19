const router = require("express").Router();
const Property = require("../models/Property/Property");
const { checkProperty } = require("../utils/validation/property");
const mongoose = require("mongoose");
const { CUSTOMER, ADMIN } = require("../models/User/roles");
const auth = require("../utils/auth/index");

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

router.post("/all", auth(CUSTOMER, ADMIN), async (req, res) => {
  /*
    ADMIN =>  Can provide userId to fetch all properties of a user.
    CUSTOMER => Can fetch his/her all properties.
  */

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
          .json({ success: false, message: "Invalid userId provided." });
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
      message: "Server error occured",
    });
  }
});

router.post("/one", auth(CUSTOMER, ADMIN), async (req, res) => {
  /*
    ADMIN =>  Can provide propertyId to fetch all details of that property.
    CUSTOMER => Can fetch all details of that property(Own).
  */

  const {
    user,
    body: { propertyId },
  } = req;

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid userId provided." });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property with the given propertyId was not found.",
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
        message: "You are not authorized to perform this action.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

router.post("/create", auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;

  const { error, value } = checkProperty.validate({
    ...body,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
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
      message: "Server error occured",
    });
  }
});

router.put("/update", auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;
  const { propertyId, ...updates } = body;

  const { error, value } = checkProperty.validate({
    ...updates,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid propertyId provided." });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property with the given propertyId was not found.",
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
        message: "You are not authorized to perform this action.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

router.delete("/delete", auth(ADMIN, CUSTOMER), async (req, res) => {
  const {
    body: { propertyId },
    user,
  } = req;

  if (!mongoose.isValidObjectId(propertyId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid propertyId provided." });
  }

  try {
    let property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property with the given propertyId was not found.",
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
        message: "You are not authorized to perform this action.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

module.exports = router;

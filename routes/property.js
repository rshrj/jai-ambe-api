const router = require("express").Router();
const Property = require("../models/Property/Property");
const { checkProperty } = require("../utils/validation/property");

/*
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
router.post("/create", async (req, res) => {
  const { body } = req;

  const { error, value } = checkProperty.validate({
    ...body,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const property = new Property({ ...body });

    await property.save();

    return res.status(201).json({
      success: true,
      payload: property,
      message: "You draft has been saved successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

module.exports = router;

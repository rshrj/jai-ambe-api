const router = require('express').Router();
const mongoose = require('mongoose');

const Listing = require('../models/Listing');
const {
  listingTypes: { RENT_LEASE, SELL_APARTMENT, SELL_PROJECT }
} = require('../models/Listing/enums');
const {
  RentLeaseValidation,
  SellApartmentValidation,
  SellProjectValidation
} = require('../utils/validation/listing');
const { CUSTOMER, ADMIN } = require('../models/User/roles');
const auth = require('../utils/auth/index');
const checkError = require('../utils/error/checkError');

// @route   GET listings/all
// @desc    ADMIN =>  Can provide userId to fetch all listings of a user. body => { listingId }
//          CUSTOMER => Can fetch his/her all listings.
// @access  CUSTOMER, ADMIN
router.get('/all', auth(CUSTOMER, ADMIN), async (req, res) => {
  const {
    user,
    body: { userId }
  } = req;

  try {
    let listings = [];

    if (user.role == ADMIN) {
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          errors: { userId: 'Invalid userId provided.' }
        });
      }

      listings = await Listing.find({ createdBy: userId });
    } else {
      listings = await Listing.find({ createdBy: user._id });
    }

    return res.status(200).json({
      success: true,
      payload: listings,
      message: 'Properties data fetched successfully.'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

// @route   POST listings/one
// @desc    ADMIN =>  Can provide listingId to fetch all details of that property.
//          CUSTOMER => Can provide listingId & fetch all details of that property(Own).
//          body => { listingId }
// @access  CUSTOMER, ADMIN
router.post('/one', auth(CUSTOMER, ADMIN), async (req, res) => {
  const {
    user,
    body: { listingId }
  } = req;

  if (!mongoose.isValidObjectId(listingId)) {
    return res.status(400).json({
      success: false,
      errors: { listingId: 'Invalid listingId provided.' }
    });
  }

  try {
    let listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        toasts: ['Listing with the given listingId was not found.']
      });
    }

    if (
      user.role == ADMIN ||
      (user.role == CUSTOMER &&
        listing.createdBy.toString() == user._id.toString())
    ) {
      return res.status(200).json({
        success: true,
        payload: listing,
        message: 'Listing details found successfully.'
      });
    } else {
      return res.status(403).json({
        success: false,
        toasts: ['You are not authorized to perform this action.']
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

/*
 @route   POST listings/add/rentlease
 @desc    Add new rentlease property
 @access  CUSTOMER, ADMIN
*/
router.post('/add/rentlease', auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;
  const {
    location,
    landmark,
    apartmentType,
    rent,
    electricityIncluded,
    priceNegotiable,
    deposit,
    numBathrooms,
    numBalconies,
    carpetArea,
    builtUpArea,
    superBuiltUpArea,
    otherRooms,
    furnishing,
    coveredParking,
    openParking,
    totalFloors,
    propertyOnFloor,
    ageOfProperty,
    availableFrom,
    willingToRentOutTo,
    pictures,
    featuredPicture,
    videoLink
  } = body;

  //Validation
  const { error, value } = checkError(RentLeaseValidation, {
    location: location,
    landmark: landmark,
    apartmentType: apartmentType,
    rent: rent,
    electricityIncluded: electricityIncluded,
    priceNegotiable: priceNegotiable,
    deposit: deposit,
    numBathrooms: numBathrooms,
    numBalconies: numBalconies,
    carpetArea: carpetArea,
    builtUpArea: builtUpArea,
    superBuiltUpArea: superBuiltUpArea,
    otherRooms: otherRooms,
    furnishing: furnishing,
    coveredParking: coveredParking,
    openParking: openParking,
    totalFloors: totalFloors,
    propertyOnFloor: propertyOnFloor,
    ageOfProperty: ageOfProperty,
    availableFrom: availableFrom,
    willingToRentOutTo: willingToRentOutTo,
    pictures: pictures,
    featuredPicture: featuredPicture,
    videoLink: videoLink
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    const listing = new Listing({
      state: 'Submitted',
      createdBy: user._id,
      listingType: RENT_LEASE,
      rentlease: {
        location: location,
        landmark: landmark,
        apartmentType: apartmentType,
        rent: rent,
        electricityIncluded: electricityIncluded,
        priceNegotiable: priceNegotiable,
        deposit: deposit,
        numBathrooms: numBathrooms,
        numBalconies: numBalconies,
        carpetArea: carpetArea,
        builtUpArea: builtUpArea,
        superBuiltUpArea: superBuiltUpArea,
        otherRooms: otherRooms,
        furnishing: furnishing,
        coveredParking: coveredParking,
        openParking: openParking,
        totalFloors: totalFloors,
        propertyOnFloor: propertyOnFloor,
        ageOfProperty: ageOfProperty,
        availableFrom: availableFrom,
        willingToRentOutTo: willingToRentOutTo,
        pictures: pictures,
        featuredPicture: featuredPicture,
        videoLink: videoLink
      }
    });

    await listing.save();

    return res.status(201).json({
      success: true,
      payload: listing,
      message: 'Rent/Lease Property added successfully.'
    });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      console.log(err.message.split(':')[2]);
    }
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

/*
 @route   POST listings/add/sellapartment
 @desc    Add new sellapartment property
 @access  CUSTOMER, ADMIN
*/
router.post('/add/sellapartment', auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;
  const {
    location,
    landmark,
    apartmentType,
    price,
    pricePerSqFt,
    allInclusivePrice,
    taxAndGovtChargesExcluded,
    priceNegotiable,
    numBathrooms,
    numBalconies,
    carpetArea,
    builtUpArea,
    superBuiltUpArea,
    otherRooms,
    furnishing,
    coveredParking,
    openParking,
    totalFloors,
    propertyOnFloor,
    ageOfProperty,
    availabilityStatus,
    ownershipType,
    usp,
    pictures,
    featuredPicture,
    videoLink
  } = body;

  //Validation
  const { error, value } = checkError(SellApartmentValidation, {
    location: location,
    landmark: landmark,
    apartmentType: apartmentType,
    price: price,
    pricePerSqFt: pricePerSqFt,
    allInclusivePrice: allInclusivePrice,
    taxAndGovtChargesExcluded: taxAndGovtChargesExcluded,
    priceNegotiable: priceNegotiable,
    numBathrooms: numBathrooms,
    numBalconies: numBalconies,
    carpetArea: carpetArea,
    builtUpArea: builtUpArea,
    superBuiltUpArea: superBuiltUpArea,
    otherRooms: otherRooms,
    furnishing: furnishing,
    coveredParking: coveredParking,
    openParking: openParking,
    totalFloors: totalFloors,
    propertyOnFloor: propertyOnFloor,
    ageOfProperty: ageOfProperty,
    availabilityStatus: availabilityStatus,
    ownershipType: ownershipType,
    usp: usp,
    pictures: pictures,
    featuredPicture: featuredPicture,
    videoLink: videoLink
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    const listing = new Listing({
      state: 'Submitted',
      createdBy: user._id,
      listingType: SELL_APARTMENT,
      sellapartment: {
        location: location,
        landmark: landmark,
        apartmentType: apartmentType,
        price: price,
        pricePerSqFt: pricePerSqFt,
        allInclusivePrice: allInclusivePrice,
        taxAndGovtChargesExcluded: taxAndGovtChargesExcluded,
        priceNegotiable: priceNegotiable,
        numBathrooms: numBathrooms,
        numBalconies: numBalconies,
        carpetArea: carpetArea,
        builtUpArea: builtUpArea,
        superBuiltUpArea: superBuiltUpArea,
        otherRooms: otherRooms,
        furnishing: furnishing,
        coveredParking: coveredParking,
        openParking: openParking,
        totalFloors: totalFloors,
        propertyOnFloor: propertyOnFloor,
        ageOfProperty: ageOfProperty,
        availabilityStatus: availabilityStatus,
        ownershipType: ownershipType,
        usp: usp,
        pictures: pictures,
        featuredPicture: featuredPicture,
        videoLink: videoLink
      }
    });

    await listing.save();

    return res.status(201).json({
      success: true,
      payload: listing,
      message: 'Sell Apartment Property added successfully.'
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error.ValidationError) {
      console.log(err.message.split(':')[2]);
    }
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

/*
 @route   POST listings/add/sellproject
 @desc    Add new sellproject property
 @access  CUSTOMER, ADMIN
*/
router.post('/add/sellproject', auth(ADMIN, CUSTOMER), async (req, res) => {
  const { body, user } = req;
  const {
    location,
    landmark,
    apartmentTypes,
    units,
    coveredParking,
    openParking,
    totalFloors,
    ageOfProperty,
    availabilityStatus,
    ownershipType,
    usp,
    pictures,
    featuredPicture,
    brochureLink,
    videoLink
  } = body;

  //Validation
  const { error, value } = checkError(SellProjectValidation, {
    location: location,
    landmark: landmark,
    apartmentTypes: apartmentTypes,
    units: units,
    coveredParking: coveredParking,
    openParking: openParking,
    totalFloors: totalFloors,
    ageOfProperty: ageOfProperty,
    availabilityStatus: availabilityStatus,
    ownershipType: ownershipType,
    usp: usp,
    pictures: pictures,
    featuredPicture: featuredPicture,
    brochureLink: brochureLink,
    videoLink: videoLink
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    const listing = new Listing({
      state: 'Submitted',
      createdBy: user._id,
      listingType: SELL_PROJECT,
      sellproject: {
        location: location,
        landmark: landmark,
        apartmentTypes: apartmentTypes,
        units: units,
        coveredParking: coveredParking,
        openParking: openParking,
        totalFloors: totalFloors,
        ageOfProperty: ageOfProperty,
        availabilityStatus: availabilityStatus,
        ownershipType: ownershipType,
        usp: usp,
        pictures: pictures,
        featuredPicture: featuredPicture,
        brochureLink: brochureLink,
        videoLink: videoLink
      }
    });

    await listing.save();

    return res.status(201).json({
      success: true,
      payload: listing,
      message: 'Sell Project Property added successfully.'
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error.ValidationError) {
      console.log(err.message.split(':')[2]);
    }
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

// @route   DELETE listings/delete
// @desc    To delete a existing property
//          body : { listingId }
// @access  CUSTOMER, ADMIN
router.delete('/delete', auth(ADMIN, CUSTOMER), async (req, res) => {
  const {
    body: { listingId },
    user
  } = req;

  if (!mongoose.isValidObjectId(listingId)) {
    return res.status(400).json({
      success: false,
      errors: { listingId: 'Invalid listingId provided.' }
    });
  }

  try {
    let listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        toasts: ['Listing with the given listingId was not found.']
      });
    }

    if (
      user.role == ADMIN ||
      (user.role == CUSTOMER &&
        listing.createdBy.toString() == user._id.toString())
    ) {
      listing = await Listing.findByIdAndDelete(listingId);

      return res.status(200).json({
        success: true,
        payload: listing,
        message: 'Listing has been deleted successfully.'
      });
    } else {
      return res.status(403).json({
        success: false,
        toasts: ['You are not authorized to perform this action.']
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

module.exports = router;

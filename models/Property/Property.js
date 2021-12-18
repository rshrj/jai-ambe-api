const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  lookingTo: {
    type: String,
    enum: ["SELL", "RESALE", "RENT"],
    required: true,
  },
  propertyType: {
    type: String,
    enum: ["RESIDENTIAL", "COMMERCIAL"],
    required: true,
  },
  propertyCategory: {
    type: String,
    enum: ["APARTMENT", "INDEPENDENT_HOUSE_OR_VILLA", "FARMHOUSE", "OTHER"], // Needs to verify this.
    required: true,
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
      min: 6,
      max: 6,
    },
  },
  details: {
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    balconies: {
      type: Number,
      required: true,
    },
  },
  area: {
    carpetArea: {
      type: String,
      required: true,
    },
    carpetAreaUnit: {
      type: String,
      required: true,
    },
    builtupArea: {
      type: String,
    },
    builtupAreaUnit: {
      type: String,
    },
  },

  otherRooms: {
    type: [String],
    enum: ["POOJA_ROOM", "STUDY_ROOM", "SERVANT_ROOM", "STORE_ROOM"],
  },
  furnishing: {
    type: String,
    enum: ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"],
  },
  coveredParking: {
    type: Number,
    required: true,
  },
  openParking: {
    type: Number,
    required: true,
  },
  totalFloor: {
    type: Number,
    required: true,
  },
  floorNo: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["READY_TO_MOVE", "UNDER_CONSTRUCTION"],
    required: true,
  },
  propertyYear: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  otherPricing: {
    maintenanceType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUALLY"],
    },
    maintenance: Number,
    expectedRent: Number,
    bookingAmount: Number,
    membershipCharge: Number,
  },
});

module.exports = mongoose.model("properties", PropertySchema);

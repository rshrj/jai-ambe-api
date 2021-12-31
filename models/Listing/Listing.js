const mongoose = require('mongoose');
const RentLeaseSchema = require('./RentLeaseSchema');
const SellApartmentSchema = require('./SellApartmentSchema');
const SellProjectSchema = require('./SellProjectSchema');
const {
  listingTypes: { RENT_LEASE, SELL_APARTMENT, SELL_PROJECT },
} = require('./enums');



const ListingSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['Submitted', 'Approved', 'Deactivated'],
  },
  listingType: {
    type: String,
    enum: [RENT_LEASE, SELL_APARTMENT, SELL_PROJECT],
    required: true,
  },
  name: {
    type: String,
    required: function () {
      return this.listingType == SELL_PROJECT;
    }
  },
  rentlease: {
    type: RentLeaseSchema,
    required: function () {
      return this.listingType == RENT_LEASE;
    },
  },
  sellapartment: {
    type: SellApartmentSchema,
    required: function () {
      return this.listingType == SELL_APARTMENT;
    },
  },
  sellproject: {
    type: SellProjectSchema,
    required: function () {
      return this.listingType == SELL_PROJECT;
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('listings', ListingSchema);

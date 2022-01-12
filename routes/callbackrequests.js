const express = require('express');
const mongoose = require('mongoose');

const CallBackRequest = require('../models/CallBackRequest');
const {
  CallBackRequestValidation,
} = require('../utils/validation/callbackrequest.js');
const checkError = require('../utils/error/checkError');
const { CUSTOMER, ADMIN } = require('../models/User/roles');
const auth = require('../utils/auth');
const router = express.Router();

/*
  All @routes
  =>   GET callbackrequests/all
  =>   POST callbackrequests/new
  =>   PUT callbackrequests/updateState
*/


// @route   GET callbackrequests/all
// @desc    To fetch all callback requests.
// @access  ADMIN
router.get('/all', auth(ADMIN), async (req, res) => {
  try {
    const allcb = await CallBackRequest.find();
    return res.json({
      success: true,
      payload: allcb,
      message: 'Call back requests fetched successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


// @route   POST callbackrequests/new
// @desc    To create a new callback request
// @access  PUBLIC
router.post('/new', async (req, res) => {
  const { name, phone, message } = req.body;

  const { error, value } = checkError(CallBackRequestValidation, {
    name,
    phone,
    message,
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    let cbreq = new CallBackRequest({ name, phone, message });
    cbreq.fromIp = req.ip;

    await cbreq.save();

    return res.json({
      success: true,
      message: 'Call back request made successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


// @route   PUT callbackrequests/updateState
// @desc    To update the state of a callback request.
// @access  ADMIN
router.put('/updateState', auth(ADMIN), async (req, res) => {
  const { callbackId, state } = req.body;

  let errors = {};
  
  if (!mongoose.isValidObjectId(callbackId)) {
    errors = { callbackId: 'Invalid listingId provided.' };
  }
  if (!['pendingCall', 'calledAlready'].includes(state)) {
    errors = { ...errors, state: 'Invalid state provided.' };
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors,
    });
  }

  try {
    let callback = await CallBackRequest.findById(callbackId);

    if (!callback) {
      return res.status(404).json({
        success: false,
        toasts: ['Callback Request with the given callbackId was not found.'],
      });
    }

    let previousState = callback.state;

    callback = await CallBackRequest.findByIdAndUpdate(
      callbackId,
      { state: state },
      { new: true }
    );

    if (previousState == callback.state){
      return res.json({success:true});
    } else {
      return res.status(200).json({
        success: true,
        payload: callback,
        message: `Callback request state changed successfully.`,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


// @route   DELETE callbackrequests/delete
// @desc    To delete a callback request.
// @access  ADMIN
router.delete('/delete', auth(ADMIN), async (req, res) => {
  const { callbackId } = req.body;

  if (!mongoose.isValidObjectId(callbackId)) {
    return res.status(400).json({
      success: false,
      errors: { callbackId: 'Invalid listingId provided.' },
    });
  }

  try {
    let callback = await CallBackRequest.findById(callbackId);

    if (!callback) {
      return res.status(404).json({
        success: false,
        toasts: ['Callback Request with the given callbackId was not found.'],
      });
    }

    callback = await CallBackRequest.findByIdAndDelete(
      callbackId
    );

      return res.status(200).json({
        success: true,
        payload: callback,
        message: `Callback request deleted successfully.`,
      });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


module.exports = router;

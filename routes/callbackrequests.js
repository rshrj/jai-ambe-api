const express = require('express');

const CallBackRequest = require('../models/CallBackRequest');
const {
  CallBackRequestValidation,
} = require('../utils/validation/callbackrequest.js');
const checkError = require('../utils/error/checkError');
const { CUSTOMER, ADMIN } = require('../models/User/roles');
const auth = require('../utils/auth');

const router = express.Router();

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

module.exports = router;

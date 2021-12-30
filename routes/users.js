const router = require('express').Router();
const validator = require('validator');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { checkUserUpdate, checkUser } = require('../utils/validation/users');
const sendMail = require('../utils/mailing/sendmail');
const User = require('../models/User/User');
const { ADMIN, CUSTOMER } = require('../models/User/roles');
const auth = require('../utils/auth');
const checkError = require('../utils/error/checkError');


// @route   GET users/all
// @desc    To get all users data
// @access  ADMIN
router.get('/all', auth(ADMIN), async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      payload: users,
      message: 'Users fetched successfully.'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ['Server error occurred'] }
    });
  }
});


// @route   GET users/me
// @desc    To get your own data.
// @access  ADMIN, CUSTOMER
router.get('/me', auth(ADMIN, CUSTOMER), async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id, 'name email phone role');
    if (!user) {
      return res.status(500).json({
        success: false,
        payload: req.user,
        errors: { toasts: ['Unable to get user details'] }
      });
    }

    console.log(req.user);
    return res.json({
      success: true,
      payload: user,
      message: 'User details found'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      payload: req.user,
      errors: { toasts: ['Server error occurred'] }
    });
  }
});


// @route   POST users/signup
// @desc    To signup a user.
//          body => { email, name: { first, last }, password, password2, phone }
// @access  PUBLIC
router.post('/signup', async (req, res, next) => {
  const {
    email,
    name: { first, last },
    phone,
    password,
    password2
  } = req.body;

  const { error, value } = checkError(checkUser, {
    email,
    name: { first, last },
    password,
    password2,
    phone,
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  let normalEmail = validator.normalizeEmail(email);

  let user = await User.findOne({ $or: [{ email: normalEmail }, { phone }] });

  if (user) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  let verificationToken = nanoid(128);

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  const newUser = new User({
    name: {
      first,
      last
    },
    email: normalEmail,
    password: hash,
    role: CUSTOMER,
    phone,
    verificationToken
  });

  try {
    await newUser.save();

    await sendMail({
      to: newUser.email,
      from: process.env.SMTPUSER,
      subject: 'Welcome to Jai Ambe Homes. Please verify your email',
      template: 'emailVerification',
      templateVars: {
        name: newUser.name.first,
        verificationLink: `${process.env.BASEURL}/auth/verify/${newUser.verificationToken}`
      }
    });

    const token = newUser.generateAuthToken();

    return res.json({
      success: true,
      payload: token,
      message:
        "Successfully created an author's account. Please verify your email"
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ['Server error occurred'] }
    });
  }
});

router.get('/test', (req, res) => {
  return res.json({
    hello: 'test!'
  });
});

// @route   PUT users/update
// @desc    To update a user profile.
//          body => { email, name: { first, last }, password, phone }
// @access  ADMIN, CUSTOMER
router.put('/update', auth(ADMIN, CUSTOMER), async (req, res) => {
  let {
    user: { _id: userId },
    body: {
      email,
      name: { first, last },
      password,
      phone,
    },
  } = req;

  const { error, value } = checkError(checkUserUpdate, {
    email,
    name: { first, last },
    password,
    phone,
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);

    const user = await User.findByIdAndUpdate(
      userId,
      { email, password, name: { first, last }, phone },
      { new: true }
    );

    if (user) {
      const token = user.generateAuthToken();
      return res.json({
        success: true,
        payload: token,
        message: 'User data has been updated successfully.'
      });
    } else {
      return res
        .status(404)
        .json({ success: false, errors: { toasts: ['User not found.'] } });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errors: { toasts: ['Server error occurred'] }
    });
  }
});

// @route   DELETE users/
// @desc    To delete a user.
//          body => { userId }
// @access  ADMIN
router.delete('/', auth(ADMIN), async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res
      .status(400)
      .json({ success: false, errors: { userId: 'Invalid userId provided.' } });
  }

  try {
    let user = await User.findByIdAndDelete(userId);

    if (user) {
      return res.status(200).json({
        success: true,
        payload: user,
        message: 'User deleted successfully.'
      });
    } else {
      return res.status(404).json({
        success: false,
        errors: { toasts: ['User with the given userId was not found.'] }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ['Server error occurred'] }
    });
  }
});

// @route   POST users/reset-password
// @desc    To reset password a user's password
//          body => { userId }
// @access  ADMIN
router.post('/reset-password', auth(ADMIN), async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res
      .status(400)
      .json({ success: false, errors: { userId: 'Invalid userId provided.' } });
  }

  try {
    let user = await User.findById(userId);

    if (user) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(user.email, salt);
      await user.save();

      return res.status(200).json({
        success: true,
        payload: {},
        message: 'Password reset successfully.'
      });
    } else {
      return res.status(404).json({
        success: false,
        errors: { toasts: ['User with the given userId was not found.'] }
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      errors: { toasts: ['Server error occurred'] }
    });
  }
});

module.exports = router;

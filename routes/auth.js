const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const { checkLogin, checkResetPassword } = require('../utils/validation/auth');
const User = require('../models/User/User');
const checkError = require('../utils/error/checkError');
const sendMail = require('../utils/mailing/sendmail');

/* 
  All @routes
  =>   POST auth/login
  =>   GET auth/verify/:token
  =>   POST auth/forgotpassword
  =>   GET auth/forgotpassword/:token
  =>   POST auth/resetpassword
*/

// @route   POST auth/login
// @desc    For login
// @access  Public
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  const { error, value } = checkError(checkLogin, {
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          toasts: ['Server error occurred'],
        });
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          toasts: ['Unable to login'],
          errors: info,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            toasts: ['Server error occurred'],
          });
        }

        const token = jwt.sign(user, process.env.JWTSECRET);

        console.log(req.user);

        return res.json({
          success: true,
          payload: token,
          message: 'Logged in successfully',
        });
      });
    }
  )(req, res, next);
});


// @route   GET auth/verify/:token
// @desc    To verify user via token
// @access  Public
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    let user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        toasts: ['Invalid verification token'],
      });
    }

    user.verificationToken = '';
    await user.save();

    return res.json({
      success: true,
      payload: user,
      message: 'Email verified successfully',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


// @route   POST auth/forgotpassword
// @desc    To initial forgotpassword
// @access  Public
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;

  const { error, value } = checkError(
    Joi.object({
      email: Joi.string().trim().email().required().label('Email'),
    }),
    {
      email,
    }
  );

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        toasts: ['Email does not exists. Please sign up.'],
      });
    }

    let verificationToken = nanoid(64);
    user.verificationToken = verificationToken;
    await user.save();
    console.log(user);

    await sendMail({
      to: user.email,
      from: process.env.SMTPUSER,
      subject: 'Reset your password.',
      template: 'resetPassword',
      templateVars: {
        name: user.name.first,
        verificationLink: `${process.env.UI_BASEURI}/forgotpassword?token=${user.verificationToken}`,
      },
    });
    console.log(
      `${process.env.UI_BASEURI}/forgotpassword?token=${user.verificationToken}`
    );

    return res.json({
      success: true,
      message: 'Please check your email to reset your password.',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


// @route   GET auth/forgotpassword/:token
// @desc    To verify forgotpassword token
// @access  Public
router.get('/forgotpassword/:token', async (req, res) => {
  const { token } = req.params;

  if(!token || token == "" || token.length != 64){
    return res.status(400).json({
      success: false,
      toasts: ['Invalid token provided'],
    });
  }

  try {
    let user = await User.findOne(
      { verificationToken: token },
      '-verificationToken -password'
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        toasts: ['Invalid token provided'],
      });
    }

    return res.json({
      success: true,
      payload: user,
      message: 'Reset password initiated.',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred'],
    });
  }
});


// @route   POST auth/resetpassword
// @desc    To reset password
// @access  Public
router.post('/resetpassword', async (req, res) => {
  const { token, password, password2 } = req.body;
  console.log(token.length);
  const { error, value } = checkError(checkResetPassword, {
    token,
    password,
    password2,
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    let user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        toasts: ['Invalid token provided.'],
      });
    }

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);

    user.verificationToken = '';
    user.password = hash;
    await user.save();

    console.log(user);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. Please login.',
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

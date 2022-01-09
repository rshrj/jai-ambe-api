const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const validator = require('validator');

const { checkLogin, checkResetPassword } = require('../utils/validation/auth');
const User = require('../models/User/User');
const checkError = require('../utils/error/checkError');
const sendMail = require('../utils/mailing/sendmail');

const uiPath = process.env.UI_BASEURL || 'http://localhost:3000';

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
  const { error, value } = checkError(checkLogin, {
    email,
    password
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          toasts: ['Server error occurred']
        });
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          toasts: ['Unable to login'],
          errors: info
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            toasts: ['Server error occurred']
          });
        }

        const token = jwt.sign(user, process.env.JWTSECRET);

        return res.json({
          success: true,
          payload: token,
          message: 'Logged in successfully'
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
        toasts: ['Invalid verification token']
      });
    }

    user.verificationToken = '';
    await user.save();

    return res.json({
      success: true,
      payload: user,
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
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
      email: Joi.string().trim().email().required().label('Email')
    }),
    {
      email
    }
  );

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    let user = await User.findOne({ email: validator.normalizeEmail(email) });

    if (!user) {
      return res.status(400).json({
        success: false,
        toasts: ['User does not exist. Please sign up.'],
        errors: { email: 'User does not exist' }
      });
    }

    if (user.verificationToken !== '') {
      return res.status(400).json({
        success: false,
        toasts: [
          'A request already exists. Please check your email for instructions'
        ],
        errors: { email: 'Check your email' }
      });
    }

    let verificationToken = nanoid(64);
    user.verificationToken = verificationToken;
    await user.save();

    await sendMail({
      to: user.email,
      from: process.env.SMTPUSER,
      subject: 'Password Reset.',
      template: 'resetPassword',
      templateVars: {
        name: user.name.first,
        verificationLink: `${uiPath}/forgotpassword?token=${user.verificationToken}`
      }
    });

    return res.json({
      success: true,
      message: 'Please check your email to reset your password.'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

// @route   GET auth/forgotpassword/:token
// @desc    To verify forgotpassword token
// @access  Public
router.get('/forgotpassword/:token', async (req, res) => {
  const { token } = req.params;

  if (!token || token == '' || token.length != 64) {
    return res.status(400).json({
      success: false,
      toasts: ['Invalid token provided']
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
        toasts: ['Invalid token provided']
      });
    }

    return res.json({
      success: true,
      payload: user,
      message: 'Reset password initiated.'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

// @route   POST auth/resetpassword
// @desc    To reset password
// @access  Public
router.post('/resetpassword', async (req, res) => {
  const { token, password, password2 } = req.body;

  const { error, value } = checkError(checkResetPassword, {
    token,
    password,
    password2
  });

  if (error) {
    return res.status(400).json({ success: false, errors: error });
  }

  try {
    let user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        toasts: ['Invalid token provided.']
      });
    }

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);

    user.verificationToken = '';
    user.password = hash;
    await user.save();

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. Please login.'
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      toasts: ['Server error occurred']
    });
  }
});

module.exports = router;

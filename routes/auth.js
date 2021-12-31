const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const { checkLogin } = require('../utils/validation/auth');
const User = require('../models/User/User');
const checkError = require('../utils/error/checkError');

// @route   POST auth/login
// @desc    For login
// @access  Public
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
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
        return res.status(500).json({
          success: false,
          errors: { toasts: ['Server error occurred'] }
        });
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Unable to login',
          errors: info
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            errors: { toasts: ['Server error occurred'] }
          });
        }

        const token = jwt.sign(user, process.env.JWTSECRET);

        console.log(req.user);

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
        errors: { toasts: ['Invalid verification token'] }
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
      errors: { toasts: ['Server error occurred'] }
    });
  }
});

module.exports = router;

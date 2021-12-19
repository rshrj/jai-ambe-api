const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { checkLogin } = require("../utils/validation/auth");
const User = require("../models/User/User");

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  if (!checkLogin(email, password)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
    });
  }

  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Server error occured",
        });
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          message: info,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Server error occured",
          });
        }

        const token = jwt.sign(user, process.env.JWTSECRET);

        console.log(req.user);

        return res.json({
          success: true,
          payload: token,
          message: "Logged in successfully",
        });
      });
    }
  )(req, res, next);
});

router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    let user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    user.verificationToken = "";
    await user.save();

    return res.json({
      success: true,
      payload: user,
      message: "Email verified successfully",
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

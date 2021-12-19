const router = require("express").Router();
const validator = require("validator");
const { nanoid } = require("nanoid");
const bcrypt = require("bcryptjs");
const { checkSignup, checkUpdate } = require("../utils/validation/users");
const sendMail = require("../utils/mailing/sendmail");
const User = require("../models/User/User");
const { ADMIN, CUSTOMER } = require("../models/User/roles");
const auth = require("../utils/auth");
const mongoose = require("mongoose");

router.get("/all", auth(ADMIN), async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({
      success: true,
      payload: users,
      message: "Users fetched successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

// Details about the currently logged in user
router.get("/me", auth(ADMIN, CUSTOMER), async (req, res, next) => {
  try {
    const user = await User.findById(
      req.user._id,
      "name email role preferredCurrency"
    );
    if (!user) {
      return res.status(500).json({
        success: false,
        payload: req.user,
        message: "Unable to get user details",
      });
    }
    console.log(req.user);
    return res.json({
      success: true,
      payload: user,
      message: "User details found",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      payload: req.user,
      message: "Server error occured",
    });
  }
});

router.post("/signup", async (req, res, next) => {
  const {
    email,
    name: { first, last },
    password,
    password2,
  } = req.body;

  if (!checkSignup(email, { first, last }, password, password2)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
    });
  }

  let normalEmail = validator.normalizeEmail(email);

  let user = await User.findOne({ email: normalEmail });

  if (user) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  let verificationToken = nanoid(128);

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);

  const newUser = new User({
    name: {
      first,
      last,
    },
    email: normalEmail,
    password: hash,
    role: CUSTOMER,
    verificationToken,
  });

  try {
    await newUser.save();

    // await sendMail({
    //   to: newUser.email,
    //   from: process.env.SMTPUSER,
    //   subject: "Welcome to Engolee PDS. Please verify your email",
    //   template: "emailVerification",
    //   templateVars: {
    //     name: newUser.name.first,
    //     verificationLink: `http://localhost:5000/auth/verify/${newUser.verificationToken}`,
    //   },
    // });

    const token = newUser.generateAuthToken();

    return res.json({
      success: true,
      payload: token,
      message:
        "Successfully created an author's account. Please verify your email",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

router.put("/update", auth(ADMIN, CUSTOMER), async (req, res) => {
  let {
    user: { _id: userId },
    body: {
      email,
      name: { first, last },
      password,
    },
  } = req;

  if (!checkUpdate(userId, email, first, last, password)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
    });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);

    const user = await User.findByIdAndUpdate(
      userId,
      { email, password, name: { first, last } },
      { new: true }
    );

    if (user) {
      const token = user.generateAuthToken();
      return res.json({
        success: true,
        payload: token,
        message: "User data has been updated successfully.",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

router.delete("/", auth(ADMIN), async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid userId provided." });
  }

  try {
    let user = await User.findByIdAndDelete(userId);

    if (user) {
      return res.status(200).json({
        success: true,
        payload: user,
        message: "User deleted successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User with the given userId was not found.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

router.post("/reset-password", auth(ADMIN), async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.isValidObjectId(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid userId provided." });
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
        message: "Password reset successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User with the given userId was not found.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});

module.exports = router;

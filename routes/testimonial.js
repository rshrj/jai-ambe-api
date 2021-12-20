const router = require("express").Router();
const Testimonial = require("../models/Testimonial");
const { checkTestimonial } = require("../utils/validation/testimonial");
const auth = require("../utils/auth");
const { ADMIN, CUSTOMER } = require("../models/User/roles");
const mongoose = require("mongoose");

/*
  PENDING WORK:
    => image upload part is pending in /add & /create routes.
    => /create needs discussion for fields.
*/

// @route   GET testimonial/all
// @desc    To Fetch all testimonial
// @access  ADMIN
router.get("/all", auth(ADMIN), async (req, res) => {
  try {
    const testimonials = await Testimonial.find();

    return res.json({
      success: true,
      payload: testimonials,
      message: "Testimonials fetched successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});


// @route   GET testimonial/show
// @desc    To fetch all approved testimonials to display on website.
// @access  ADMIN
router.get("/show", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ show: true });

    return res.json({
      success: true,
      payload: testimonials,
      message: "Testimonials fetched successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});


// @route   POST testimonial/add
// @desc    To add new testimonial via form on website.
//          body => { name, company, image, mobile, testimonial }
// @access  Public
router.post("/add", async (req, res) => {
  const { body } = req;
  const { error, value } = checkTestimonial.validate({
    ...body,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const testimonial = new Testimonial({ ...value });

    await testimonial.save();

    return res.status(201).json({
      success: true,
      payload: {},
      message: "Testimonial added successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});


// @route   POST testimonial/create
// @desc    To add new testimonial by existing user.
//          body => { name, company, image, mobile, testimonial }
// @access  CUSTOMER, ADMIN
router.post("/create", auth(CUSTOMER, ADMIN), async (req, res) => {
  const { body, user } = req;

  const { error, value } = checkTestimonial.validate({
    ...body,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    let testimonial;
    if (user.role == ADMIN) {
      testimonial = new Testimonial({ ...value });
    } else {
      testimonial = new Testimonial({ ...value, userId: user._id });
    }

    await testimonial.save();

    return res.status(201).json({
      success: true,
      payload: {},
      message: "Testimonial added successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});


// @route   PUT testimonial/update
// @desc    To update an existing testimonial
//          body => { name, company, image, mobile, testimonial }
// @access  ADMIN
router.put("/update", auth(ADMIN), async (req, res) => {
  const { testimonialId, ...updates } = req.body;

  const { error, value } = checkTestimonial.validate({
    ...updates,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  if (!mongoose.isValidObjectId(testimonialId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid testimonialId provided." });
  }

  try {
    let testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial with the given testimonialId was not found.",
      });
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      { ...value },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      payload: testimonial,
      message: "Testimonial updated successfully.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error occured",
    });
  }
});


// @route   DELETE testimonial/delete
// @desc    To update an existing testimonial
//          body => { testimonialId }
// @access  ADMIN
router.delete("/delete", auth(ADMIN), async (req, res) => {
  const { testimonialId } = req.body;

  if (!mongoose.isValidObjectId(testimonialId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid testimonialId provided." });
  }

  try {
    let testimonial = await Testimonial.findByIdAndDelete(testimonialId);

    if (testimonial) {
      return res.status(200).json({
        success: true,
        payload: testimonial,
        message: "Testimonial deleted successfully.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Testimonial with the given testimonialId was not found.",
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

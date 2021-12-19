const router = require("express").Router();
const Testimonial = require("../models/Testimonial");
const { checkTestimonial } = require("../utils/validation/testimonial");
const auth = require("../utils/auth");
const { ADMIN, CUSTOMER } = require("../models/User/roles");
const mongoose = require("mongoose");

/*
    => image upload part is pending in /add & /create routes.
    => /create needs discussion for fields.
*/

//To Fetch all testimonial
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

//To fetch all approved testimonials to display on website.
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

//This route is for not registered user who can give testimonial via form.
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

//For registered users
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

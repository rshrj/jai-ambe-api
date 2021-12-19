const router = require("express").Router();
const Testimonial = require("../models/Testimonial");
const { checkTestimonial } = require("../utils/validation/testimonial");

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

module.exports = router;

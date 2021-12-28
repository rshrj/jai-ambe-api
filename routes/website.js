const router = require("express").Router();
const multer = require("multer");
const auth = require("../utils/auth");
const { ADMIN } = require("../models/User/roles");

//multer settings
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images/"),
  filename: (req, file, cb) =>
    cb(null, "poster." + file.originalname.split(".")[1]),
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5242880 }, // 5mb in bytes
}).single("poster");


// @route   POST website/poster
// @desc    Edit advertisement poster on home page (a simple image of fixed dimensions will be replaced)
//          Note : name attribute should be "poster"
// @access  ADMIN
router.post("/poster", auth(ADMIN), async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({
        success: false,
        errors: { toasts: ["Server error occurred"] },
      });
    } else if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: { toasts: ["Please upload an image."] }
      });
    } else {
      return res.json({
        success: true,
        message: "Poster uploaded successfully.",
      });
    }
  });
});

module.exports = router;

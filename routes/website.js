const router = require('express').Router();
const nodePath = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../utils/auth');
const { CUSTOMER, ADMIN } = require('../models/User/roles');
const { nanoid } = require('nanoid');
const Upload = require('../models/Upload');

const uploadSettings = {
  image: {
    formFieldName: 'picture',
    allowMimetype: ['image/png', 'image/jpg', 'image/jpeg'],
    fileSizeLimit: 5242880, //5mb in bytes
  },
};

// @route   POST website/upload/:type/:id
// @desc    To upload a file according to setting and get url to access that file.
//          params  =>  {
//                        type : This will be setting type
//                        id : a unique id to identify image.
//                      }
// @access  ADMIN, CUSTOMER
router.post('/upload/:type/:id', auth(CUSTOMER, ADMIN), async (req, res) => {
  const { user, params } = req;
  const { type, id } = params;

  let errors = {};
  if (!Object.keys(uploadSettings).includes(type)) {
    errors = { type: 'Please provide a valid upload type.' };
  }
  if (!id) {
    errors = { ...errors, id: 'Please provide a valid id.' };
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors: errors });
  }

  // To check & create uploaded folder in public folder in root directory .
  let folderName = nodePath.join(__dirname, '..','public');

  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  folderName = nodePath.join(__dirname, '..', 'public', 'uploaded');

  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }

  //multer settings
  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploaded'),
    filename: (req, file, cb) => {
      const fileName = nanoid() + '.' + file.originalname.split('.').pop();
      return cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    try {
      if (uploadSettings[type].allowMimetype.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    } catch (err) {
      cb(err);
    }
  };

  const upload = multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: { fileSize: uploadSettings[type].fileSizeLimit }, // 5mb in bytes
  }).single(uploadSettings[type].formFieldName);

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      console.log(err);
      // An unknown error occurred when uploading.
      return res.status(500).json({
        success: false,
        errors: { toasts: ['Server error occurred'] },
      });
    } else if (!req.file) {
      return res.status(400).json({
        success: false,
        errors: { toasts: ['Please upload an image.'] },
      });
    } else {
      try {
        const path = `${process.env.BASEURL}/uploaded/${req.file.filename}`;

        const uploadedFile = new Upload({
          path,
          uploadSettingType: type,
          id,
          uploadedBy: user._id,
        });
        await uploadedFile.save();

        return res.json({
          success: true,
          payload: { id, path },
          message: 'File uploaded successfully.',
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          errors: { toasts: ['Server error occurred'] },
        });
      }
    }
  });
});

module.exports = router;

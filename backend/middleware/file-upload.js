const multer = require("multer");
const { v1: uuidv1 } = require("uuid"); // for unique file names
const MIME_TYPE_MAP = {
  // for validating file types
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const fileUpload = multer({
  // configuring multer
  limits: 50000, // max size of incoming file
  storage: multer.diskStorage({
    // configuring storage
    destination: (req, file, cb) => {
      // setting destination for file
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      // setting file name
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv1() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype]; //validating file extension
    let error = isValid ? null : new Error("invalid mime type"); //generating error message
    cb(error, isValid);
  },
});

module.exports = fileUpload;

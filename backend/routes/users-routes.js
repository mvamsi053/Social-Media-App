const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const usersController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload"); // importing middleware

router.get("/", usersController.getUsers);
router.post(
  "/signup",
  fileUpload.single("image"), // multer  middleware
  [check("name").not().isEmpty(), check("email").normalizeEmail().isEmail()],
  check("password").isLength({ min: 6 }),
  usersController.signUpUser
);
router.post("/login", usersController.login);

module.exports = router;

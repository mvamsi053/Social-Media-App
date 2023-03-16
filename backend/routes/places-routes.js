const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const placesController = require("../controllers/places-controller");
const fileUpload = require("../middleware/file-upload");
const chechAuth = require("../middleware/check-auth");
router.get("/:placeId", placesController.getPlaceById);
router.get("/users/:uid", placesController.getPlacesByUserId);
router.use(chechAuth);
router.post(
  "/",
  fileUpload.single("image"), // multer  middleware
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);
router.delete("/:pid", placesController.deletePlace);
module.exports = router;

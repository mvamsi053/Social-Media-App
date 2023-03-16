const { validationResult } = require("express-validator");
const fs = require("fs");

const { v4: uuid } = require("uuid");
const getCoordinates = require("../util/location");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const mongoose = require("mongoose");
const User = require("../models/user");
const getPlaceById = async (req, res, next) => {
  console.log("Get request");
  const placeid = req.params.placeId;
  let place;

  try {
    place = await Place.findById({ _id: placeid });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Couldn't find a place for the id", 404);
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong,fetching error,try again later",
      500
    );
    return next(error);
  }

  // if (!userWithPlaces?.places.length) {
  //   const error = new HttpError("Couldn't find a places for the user id", 404);
  //   return next(error);
  // }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed", 422));
  }

  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordinates(address);
  } catch (error) {
    return next(error);
  }
  const newPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    image: req.file.path,
    creator: req.userData.userId,
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Creating place failed ,please try again", 500));
  }

  if (!user) {
    return next(new HttpError("Couldn't find the user", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess });
    user.places.push(newPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = HttpError("Error creating place,Try again later!", 500);
    return next(error);
  }

  res.status(201).json({ place: newPlace.toObject({ getters: true }) });
};
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed", 422));
  }
  const { title, description } = req.body;
  const pid = req.params.pid;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = HttpError("Error updating place ,Something went wrong", 500);
    return next(error);
  }
  if (place.creator.toString() !== req.userData.userId) {
    const error = HttpError("You are not allowed to edit this place", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong,coudn't update place",
      500
    );
    return next(error);
  }
  res.status(201).json({ place: place.toObject({ getters: true }) });
};
const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  let place;
  try {
    place = await Place.findById(pid).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went Wrong,Coudn't delete place",
      500
    );
    return next(error);
  }
  if (!place) {
    return next(new HttpError("Couldn't find place for this id", 404));
  }
  if (place.creator.id !== req.userData.userId) {
    const error = HttpError("You are not allowed to DELETE this place", 401);
    return next(error);
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went Wrong,Coudn't delete place",
      500
    );
    return next(error);
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Place Deleted" });
};
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

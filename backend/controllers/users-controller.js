const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password"); // -password is to remove password from the response
  } catch (err) {
    return next(new HttpError("Something went worng,can't find users", 500));
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signUpUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed", 422));
  }
  const { name, email, password } = req.body;
  let isHavingAccount;
  try {
    isHavingAccount = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong, Signup error", 500);
    return next(error);
  }

  if (isHavingAccount) {
    return next(new HttpError("User with email already exist", 422));
    1;
  }
  let hasedPassword;
  try {
    hasedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Couldn't create user,please try again", 500);
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    password: hasedPassword,
    places: [],
    image: req.file.path,
  });
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Something went wrong, Signup error", 500);
    return next(error);
  }
  // GENEARATING JWT TOKEN FOR SIGNIN
  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWTKEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Something went wrong, Signup error", 500);
    return next(error);
  }
  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let isHavingAccount;
  try {
    isHavingAccount = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Something went wrong,Login error", 500);
    return next(error);
  }
  if (!isHavingAccount) {
    return next(new HttpError("Invalid credentials,coudn't log you in", 403));
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, isHavingAccount.password);
  } catch (err) {
    const error = new HttpError(
      "Couldn't log you in, Please check your credentials and login again",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials,coudn't log you in", 403));
  }
  // GENEARATING JWT TOKEN FOR SIGNIN
  let token;
  try {
    token = jwt.sign(
      { userId: isHavingAccount.id, email: isHavingAccount.email },
      process.env.JWTKEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Something went wrong, Login error", 500);
    return next(error);
  }
  res.status(200).json({
    userId: isHavingAccount.id,
    email: isHavingAccount.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUpUser = signUpUser;
exports.login = login;

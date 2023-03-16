const HttpError = require("../models/http-error");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new HttpError("Autentication failed!", 403);
    }
    const decodedToken = jwt.verify(token, process.env.JWTKEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("Autentication failed!", 403));
  }
};

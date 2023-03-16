const axios = require("axios");
const dotenv = require("dotenv");
const HttpError = require("../models/http-error");
dotenv.config();
async function getCoordinates(address) {
  const query = address;
  const apiKey = process.env.WEATHER_API_KEY;

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&appid=${apiKey}`;
  const respdata = await axios.get(url);
  const data = respdata.data;

  if (data.length === 0) {
    const error = new HttpError(
      "Could not find location for the specified address",
      404
    );
    throw error;
  }
  const coordinates = { lat: data[0].lat, lang: data[0].lon };

  return coordinates;
}
module.exports = getCoordinates;

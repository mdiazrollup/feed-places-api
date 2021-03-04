const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyBdZErs4OPITB1J5rsFbDG5f1sKRVL7fCA';

const getCoordForAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError('Could not find location', 422);
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
};

module.exports = getCoordForAddress;

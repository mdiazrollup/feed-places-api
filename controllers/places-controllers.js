const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');

const HttpError = require('../models/http-error');
const getCoordForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const deleteImage = require('../utils/delete-image');

const getPlaceById = async (req, res, next) => {
  const pid = req.params.pid;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, can not find place',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Place not found!', 404);
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(uid).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, can not find places',
      500
    );
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError('Places not found!', 404));
  }
  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid request', 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.location,
    imageKey: req.file.key,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError('Creating place failed', 500));
  }

  if (!user) {
    return next(new HttpError('Invalid user for place', 404));
  }

  try {
    // We need to create a place and update a use so we have to do a transactional operation
    const session = await mongoose.startSession();
    session.startTransaction();
    createdPlace.save({ session });
    //push is a mongoose method
    user.places.push(createdPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Creating place failed', 500);
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError('Invalid request', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, can not find place',
      500
    );
    return next(error);
  }

  if (updatedPlace.creator.toString() !== req.userData.userId) {
    new HttpError('Not allowed', 403);
  }

  if (!updatedPlace) {
    const error = new HttpError('Place not found!', 404);
    return next(error);
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (err) {
    return next(
      new HttpError('Something went wrong, can not update place', 500)
    );
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    // populate to get info about user of this place with this call
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, can not find place',
      500
    );
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    new HttpError('Not allowed', 403);
  }

  if (!place) {
    return next(new HttpError('Place not found!', 404));
  }

  //const imagePath = place.image;
  const imageKey = place.imageKey;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    // pull is a mongoose method
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpError('Something went wrong, can not delete place', 500)
    );
  }

  // fs.unlink(imagePath, (err) => console.log(err));
  deleteImage(imageKey);

  res.status(200).json({ message: 'Place deleted' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

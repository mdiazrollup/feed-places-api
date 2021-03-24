const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(new HttpError('Something went wrong signing up', 500));
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid request', 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError('Something went wrong signing up', 500));
  }

  if (existingUser) {
    return next(new HttpError('User already exists', 422));
  }

  const createdUser = new User({
    name,
    email,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSppkoKsaYMuIoNLDH7O8ePOacLPG1mKXtEng&usqp=CAU',
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Something went wrong signing up', 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError('Something went wrong signing up', 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError('Could not identifyUser', 401));
  }

  res.json({
    message: 'Logged in',
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

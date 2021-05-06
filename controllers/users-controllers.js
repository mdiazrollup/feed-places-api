const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const PRIVATE_KEY = process.env.JWT_KEY;

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

  let hashedPwd;
  try {
    hashedPwd = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user', 500));
  }

  const createdUser = new User({
    name,
    email,
    image: req.file.location,
    password: hashedPwd,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Something went wrong signing up', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      PRIVATE_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('Something went wrong signing up', 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError('Something went wrong login in', 500));
  }

  if (!existingUser) {
    return next(new HttpError('Could not identifyUser', 401));
  }

  let isValidPwd = false;
  try {
    isValidPwd = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError('Something went wrong login in', 500));
  }

  if (!isValidPwd) {
    return next(new HttpError('Invalid credentials', 401));
  }

  //Token generation
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      PRIVATE_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(new HttpError('Something went wrong login in', 500));
  }

  res.json({ userId: existingUser.id, email: existingUser.email, token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

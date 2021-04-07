const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const PRIVATE_KEY = 'supercalifragilistico_espialidoso';

module.exports = (req, res, next) => {
  // Options request don't need authorization
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication failed');
    }
    const decodedToken = jwt.verify(token, PRIVATE_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError('Authentication failed', 403));
  }
};

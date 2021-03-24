const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

const uri =
  'mongodb+srv://root:p4ssw0rd@cluster0.55nug.mongodb.net/feed-places?retryWrites=true&w=majority';

app.use(bodyParser.json());

// Middleware to add headers to response and prevent CORS errors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, GET, PATCH, DELETE, OPTIONS'
  );

  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// Middleware for not handle routes
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});

//Errors Middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error ocurred!' });
});

mongoose
  .connect(uri)
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const HttpError = require('./models/http-error');
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Feed Places API',
      version: '1.0.0',
      description: 'Api to display application users and places',
    },
  },
  apis: ['./routes/*routes*.js'], // files containing annotations as above
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.55nug.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());

// To serve images statically
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

//Swagger middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(typeof error.code === 'number' ? error.code : 500);
  res.json({ message: error.message || 'An unknown error ocurred!' });
});

mongoose
  .connect(uri)
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });

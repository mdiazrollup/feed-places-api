const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

/**
 * @openapi
 * tags:
 *  name: places
 */

/**
 * @openapi
 * components:
 *  schemas:
 *    Location:
 *      type: object
 *      properties:
 *        lat:
 *          type: number
 *        lng:
 *          type: number
 *      required:
 *        - lat
 *        - lng
 *    Place:
 *      type: object
 *      properties:
 *        title:
 *          type: string
 *          description: The place's title
 *        description:
 *          type: string
 *          description: The place's description
 *        address:
 *          type: string
 *          description: The place's address
 *        image:
 *          type: string
 *          description: Url path for the place image
 *        creator:
 *          type: string
 *          format: uuid
 *          description: Id of the user creator
 *        location:
 *          $ref: '#/components/schemas/Location'
 *      required:
 *        - title
 *        - description
 *        - address
 *        - image
 *        - creator
 *        - location
 */

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.get('/:pid', placesControllers.getPlaceById);

// Middleware to handle token validation.
// Only for the routes that follow
router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;

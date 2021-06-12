const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

/**
 * @openapi
 * tags:
 *  name: users
 */

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The user's name
 *        email:
 *          type: string
 *          description: The user's email
 *        password:
 *          type: string
 *          minLength: 6
 *          description: The user's password
 *        image:
 *          type: string
 *          description: Url path for the user avatar
 *      required:
 *        - name
 *        - email
 *        - password
 *        - image
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *      tags: [users]
 *      description: Get all users
 *      responses:
 *        200:
 *          description: Success
 *
 */
router.get('/', usersControllers.getUsers);
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersControllers.signup
);
router.post('/login', usersControllers.login);

module.exports = router;

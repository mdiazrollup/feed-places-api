const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const s3 = new aws.S3();

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/images');
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuidv4() + '.' + ext);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     const error = isValid ? null : new Error('Invalid mime type!');
//     cb(error, isValid);
//   },
// });

const fileUpload = multer({
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid mime type!');
    cb(error, isValid);
  },
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'md-feed-images',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: 'Testing_Metadata' });
    },
    key: (req, file, cb) => {
      cb(null, uuidv4());
    },
  }),
});

module.exports = fileUpload;

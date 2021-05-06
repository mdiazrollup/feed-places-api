const aws = require('aws-sdk');
const s3 = new aws.S3();

const deleteImage = (imageKey) => {
  s3.deleteObject(
    {
      Bucket: 'md-feed-images',
      Key: imageKey,
    },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

module.exports = deleteImage;

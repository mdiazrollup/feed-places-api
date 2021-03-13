const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
});

// The unique on the schema is not enough to have an error when email is repeated for that we set this plugin of a new lib
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);

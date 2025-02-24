const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  firstname: String,
  lastname: String,
  password: { type: String, required: true },
  createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

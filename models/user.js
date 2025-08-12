// models/user.js
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v), // no require_protocol
      message: "You must enter a valid URL",
    },
  },
});

module.exports = mongoose.model("user", userSchema);

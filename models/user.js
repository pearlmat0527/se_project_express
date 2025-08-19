// models/user.js
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 30 },
    avatar: {
      type: String,
      required: true,
      validate: {
        validator: (v) =>
          validator.isURL(v, {
            protocols: ["http", "https"],
            require_protocol: true,
          }),
        message: "Invalid URL",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true, // schema-level hint
      lowercase: true,
      trim: true,
      validate: { validator: validator.isEmail, message: "Invalid email" },
    },
    password: { type: String, required: true, select: false },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);

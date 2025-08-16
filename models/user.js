// models/user.js
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, minlength: 2, maxlength: 30, default: "Explorer" },
    avatar: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Invalid URL",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true, // keep unique here
      lowercase: true,
      validate: { validator: validator.isEmail, message: "Invalid email" },
    },
    password: { type: String, required: true, select: false },
  },
  { versionKey: false }
);

// If you added this earlier, **remove** it to stop the duplicate index warning:
// userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);

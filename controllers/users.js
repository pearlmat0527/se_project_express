const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  OK,
  CREATED,
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  CONFLICT,
} = require("../utils/errors");

// POST /signin
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email)
      return res.status(BAD_REQUEST).send({ message: "Email is required" });
    if (!password)
      return res.status(BAD_REQUEST).send({ message: "Password is required" });

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+password");
    if (!user)
      return res
        .status(UNAUTHORIZED)
        .send({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res
        .status(UNAUTHORIZED)
        .send({ message: "Invalid email or password" });

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(OK).send({ token });
  } catch (e) {
    return next(e);
  }
}

// POST /signup
async function createUser(req, res, next) {
  try {
    const { name, avatar, email, password } = req.body;

    if (!email || !password) {
      return res
        .status(BAD_REQUEST)
        .send({ message: "Email and password are required" });
    }

    // ❌ REMOVE the exists() pre-check (duplicate is handled by the unique index)
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      avatar,
      email: String(email).toLowerCase().trim(),
      password: hash,
    });

    const obj = user.toObject();
    delete obj.password;
    return res.status(CREATED).send(obj);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(CONFLICT)
        .send({ message: "User with this email already exists" });
    }
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res
        .status(BAD_REQUEST)
        .send({ message: "Invalid data for user creation" });
    }
    return next(err);
  }
}

// GET /users/me
async function getCurrentUser(req, res, next) {
  try {
    const me = await User.findById(req.user._id).select("-password");
    if (!me) return res.status(NOT_FOUND).send({ message: "User not found" });
    return res.status(OK).send(me);
  } catch (e) {
    return next(e);
  }
}

// PATCH /users/me
async function updateUser(req, res, next) {
  try {
    const { name, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true, select: "-password" }
    );
    if (!updated)
      return res.status(NOT_FOUND).send({ message: "User not found" });
    return res.status(OK).send(updated);
  } catch (e) {
    if (e.name === "ValidationError" || e.name === "CastError") {
      return res
        .status(BAD_REQUEST)
        .send({ message: "Invalid data for user update" });
    }
    return next(e);
  }
}

module.exports = { login, createUser, getCurrentUser, updateUser };

const mongoose = require("mongoose");
const User = require("../models/user");
const { BAD_REQUEST, NOT_FOUND } = require("../utils/errors");

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid userId" });
  }

  return User.findById(userId)
    .orFail(() => {
      const err = new Error("User not found");
      err.statusCode = NOT_FOUND;
      throw err;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid userId" });
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((created) => res.status(201).send(created))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data for user creation" });
      }
      return next(err);
    });
};

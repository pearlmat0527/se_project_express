const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const { BAD_REQUEST, NOT_FOUND } = require("../utils/errors");

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

// GET /items
module.exports.getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

// POST /items
module.exports.createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body; // owner not required by tests
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((created) => res.status(201).send(created))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data for item creation" });
      }
      return next(err);
    });
};

// DELETE /items/:itemId
module.exports.deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
  }

  return ClothingItem.findByIdAndDelete(itemId)
    .orFail(() => {
      const err = new Error("Item not found");
      err.statusCode = NOT_FOUND;
      throw err;
    })
    .then((deleted) => res.send({ message: "Item deleted", item: deleted }))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
      }
      return next(err);
    });
};

// PUT /items/:itemId/likes
// PUT /items/:itemId/likes
module.exports.likeItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } }, // add only if not present
    { new: true, runValidators: true }
  )
    .orFail(() => {
      const err = new Error("Item not found");
      err.statusCode = NOT_FOUND;
      throw err;
    })
    .then((updated) => res.send(updated))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
      }
      return next(err);
    });
};

// DELETE /items/:itemId/likes
// DELETE /items/:itemId/likes
module.exports.dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } }, // remove if present
    { new: true, runValidators: true }
  )
    .orFail(() => {
      const err = new Error("Item not found");
      err.statusCode = NOT_FOUND;
      throw err;
    })
    .then((updated) => res.send(updated))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
      }
      return next(err);
    });
};

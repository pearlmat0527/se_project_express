// controllers/clothingItems.js
const mongoose = require("mongoose");
const Item = require("../models/clothingItem");
const { BAD_REQUEST, NOT_FOUND, FORBIDDEN } = require("../utils/errors");

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

// GET /items (public)
module.exports.getItems = (req, res, next) => {
  Item.find({})
    .then((items) => res.send(items))
    .catch(next);
};

// POST /items (protected)
module.exports.createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  Item.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid data for item creation" });
      }
      return next(err);
    });
};

// PUT /items/:itemId/likes (protected)
module.exports.likeItem = (req, res, next) => {
  const { itemId } = req.params;
  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
  }

  return Item.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.send(item);
    })
    .catch(next);
};

// DELETE /items/:itemId/likes (protected)
module.exports.dislikeItem = (req, res, next) => {
  const { itemId } = req.params;
  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
  }

  return Item.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.send(item);
    })
    .catch(next);
};

// DELETE /items/:itemId (protected)
module.exports.deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid itemId" });
  }

  return Item.findById(itemId)
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      if (String(item.owner) !== String(req.user._id)) {
        return res
          .status(FORBIDDEN)
          .send({ message: "You cannot delete another user's item" });
      }
      return item.deleteOne().then(() => res.send(item));
    })
    .catch(next);
};

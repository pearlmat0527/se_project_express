// controllers/clothingItems.js
const mongoose = require("mongoose");
const Item = require("../models/clothingItem");
const { CREATED, OK } = require("../utils/errors");

const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

// GET /items (public)
module.exports.getItems = (req, res, next) => {
  Item.find({})
    .then((items) => res.status(OK).send(items))
    .catch(next);
};

// POST /items (protected)
module.exports.createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  Item.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(CREATED).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data for item creation"));
      }
      return next(err);
    });
};

// PUT /items/:itemId/likes (protected)
module.exports.likeItem = (req, res, next) => {
  const { itemId } = req.params;
  if (!isValidObjectId(itemId)) {
    return next(new BadRequestError("Invalid itemId"));
  }

  return Item.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) throw new NotFoundError("Item not found");
      return res.status(OK).send(item);
    })
    .catch(next);
};

// DELETE /items/:itemId/likes (protected)
module.exports.dislikeItem = (req, res, next) => {
  const { itemId } = req.params;
  if (!isValidObjectId(itemId)) {
    return next(new BadRequestError("Invalid itemId"));
  }

  return Item.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) throw new NotFoundError("Item not found");
      return res.status(OK).send(item);
    })
    .catch(next);
};

// DELETE /items/:itemId (protected)
module.exports.deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  if (!isValidObjectId(itemId)) {
    return next(new BadRequestError("Invalid itemId"));
  }

  return Item.findById(itemId)
    .then((item) => {
      if (!item) throw new NotFoundError("Item not found");
      if (String(item.owner) !== String(req.user._id)) {
        throw new ForbiddenError("You cannot delete another user's item");
      }
      return item.deleteOne().then(() => res.status(OK).send(item));
    })
    .catch(next);
};

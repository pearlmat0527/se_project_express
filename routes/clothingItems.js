// routes/clothingItems.js
const router = require("express").Router();
const {
  createItem,
  likeItem,
  dislikeItem,
  deleteItem,
} = require("../controllers/clothingItems");

const {
  validateCreateItem,
  validateItemIdParam,
} = require("../middlewares/validators");

// All routes here are protected by auth middleware from routes/index.js
router.post("/", validateCreateItem, createItem);
router.put("/:itemId/likes", validateItemIdParam, likeItem);
router.delete("/:itemId/likes", validateItemIdParam, dislikeItem);
router.delete("/:itemId", validateItemIdParam, deleteItem);

module.exports = router;



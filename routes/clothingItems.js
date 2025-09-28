// routes/clothingItems.js
const router = require("express").Router();
const {
  getItems, // NOTE: keep GET /items public in app.js (don’t mount here)
  createItem,
  likeItem,
  dislikeItem,
  deleteItem,
} = require("../controllers/clothingItems");

const {
  validateCreateItem,
  validateItemIdParam,
} = require("../middlewares/validators");

// DO NOT define router.get('/') here — app.js exposes public GET /items
router.post("/", validateCreateItem, createItem);
router.put("/:itemId/likes", validateItemIdParam, likeItem);
router.delete("/:itemId/likes", validateItemIdParam, dislikeItem);
router.delete("/:itemId", validateItemIdParam, deleteItem);

module.exports = router;

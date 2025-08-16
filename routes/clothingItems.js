// routes/clothingItems.js
const express = require("express");
const itemsCtrl = require("../controllers/clothingItems"); // ← make sure the path & casing match the file exactly

const router = express.Router();

// Do NOT put router.get("/") here — GET /items is public in app.js
router.post("/", itemsCtrl.createItem); // POST /items
router.delete("/:itemId", itemsCtrl.deleteItem); // DELETE /items/:itemId
router.put("/:itemId/likes", itemsCtrl.likeItem); // PUT /items/:itemId/likes
router.delete("/:itemId/likes", itemsCtrl.dislikeItem); // DELETE /items/:itemId/likes

module.exports = router;

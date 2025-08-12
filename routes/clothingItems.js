const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

router.get("/", getItems); // GET /items
router.post("/", createItem); // POST /items
router.delete("/:itemId", deleteItem); // DELETE /items/:itemId

router.put("/:itemId/likes", likeItem); // PUT /items/:itemId/likes
router.delete("/:itemId/likes", dislikeItem); // DELETE /items/:itemId/likes

module.exports = router;

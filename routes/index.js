// routes/index.js
const express = require("express");
const { login, createUser } = require("../controllers/users");
const { getItems } = require("../controllers/clothingItems"); // public GET
const usersRouter = require("./users");
const itemsRouter = require("./clothingItems"); // ← match file name
const auth = require("../middlewares/auth");

const router = express.Router();

// Public endpoints
router.post("/signin", login);
router.post("/signup", createUser);
router.get("/items", getItems); // public

// Protected endpoints
router.use(auth);
router.use("/users", usersRouter); // /users/me (GET/PATCH)
router.use("/items", itemsRouter); // POST/PUT/DELETE likes etc.

module.exports = router;

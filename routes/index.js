// routes/index.js
const express = require("express");
const { login, createUser } = require("../controllers/users");
const { getItems } = require("../controllers/clothingItems");
const usersRouter = require("./users");
const itemsRouter = require("./clothingItems");
const auth = require("../middlewares/auth");
const { validateSignin, validateSignup } = require("../middlewares/validators");

const router = express.Router();

// ----- Public endpoints -----
router.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Crash test endpoint
router.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

router.post("/signin", validateSignin, login); // <-- ADD validateSignin
router.post("/signup", validateSignup, createUser); // <-- ADD validateSignup
router.get("/items", getItems);

// ----- Auth gate (everything below is protected) -----
router.use(auth);

// ----- Protected routers -----
router.use("/users", usersRouter);
router.use("/items", itemsRouter);

module.exports = router;

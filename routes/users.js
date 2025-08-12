const router = require("express").Router();
const { getUsers, getUser, createUser } = require("../controllers/users");

// relative to /users mount
router.get("/", getUsers); // GET /users
router.get("/:userId", getUser); // GET /users/:userId
router.post("/", createUser); // POST /users

module.exports = router;

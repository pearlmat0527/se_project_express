// routes/users.js
const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateUpdateMe } = require("../middlewares/validators");

router.get("/me", getCurrentUser);
router.patch("/me", validateUpdateMe, updateUser);

module.exports = router;

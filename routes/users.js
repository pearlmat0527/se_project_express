// routes/users.js
const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { celebrate, Joi } = require("celebrate");
const isURL = require("validator/lib/isURL");

const urlString = Joi.string().custom((value, helpers) => {
  return isURL(value, { require_protocol: true, protocols: ["http", "https"] })
    ? value
    : helpers.error("string.uri");
}, "http/https URL validation");

const validateUpdateMe = celebrate({
  body: Joi.object({
    name: Joi.string().min(2).max(30).optional(),
    avatar: urlString.optional(),
  }).required(),
});

router.get("/me", getCurrentUser);
router.patch("/me", validateUpdateMe, updateUser);

module.exports = router;

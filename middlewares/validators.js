// middlewares/validators.js
const { celebrate, Joi, Segments } = require("celebrate");
const isURL = require("validator/lib/isURL");

// Reusable MongoDB ObjectId validator
const objectId = Joi.string().hex().length(24);

// Strict http/https URL validator
const urlString = Joi.string().custom((value, helpers) => {
  const ok = isURL(value, {
    require_protocol: true,
    protocols: ["http", "https"],
  });
  return ok ? value : helpers.error("string.uri");
}, "http/https URL validation");

/* =========================
   AUTH
   ========================= */
const validateSignup = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(30).optional(), // optional per spec/tests
    avatar: urlString.optional(), // tests send avatar on happy path
  })
    .required()
    .unknown(true), // don't fail if extra fields are present
});

const validateSignin = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).required(),
});

/* =========================
   USERS
   ========================= */
const validateUserIdParam = celebrate({
  [Segments.PARAMS]: Joi.object({ userId: objectId.required() }).required(),
});

/* =========================
   CLOTHING ITEMS (WTWR)
   ========================= */
const validateCreateItem = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30).required(),
    imageUrl: urlString.required(),
    weather: Joi.string().valid("hot", "warm", "cold").required(),
  }).required(),
});

const validateItemIdParam = celebrate({
  [Segments.PARAMS]: Joi.object({ itemId: objectId.required() }).required(),
});


// middlewares/validators.js
// Add this with your other validators:

const validateUpdateMe = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30).optional(),
    avatar: urlString.optional(),
  }).required(),
});

// Then add it to exports:
module.exports = {
  // public
  validateSignin,
  validateSignup,
  // users
  validateUserIdParam,
  validateUpdateMe,  // <-- ADD THIS
  // items
  validateCreateItem,
  validateItemIdParam,
};
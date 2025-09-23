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
  [Segments.BODY]: Joi.object()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      name: Joi.string().min(2).max(30).required(),
    })
    .required(),
});

const validateSignin = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    })
    .required(),
});

/* =========================
   USERS (examples you can use in routes/users.js)
   ========================= */
const validateUserIdParam = celebrate({
  [Segments.PARAMS]: Joi.object()
    .keys({ userId: objectId.required() })
    .required(),
});

/* =========================
   CLOTHING ITEMS (WTWR)
   ========================= */
const validateCreateItem = celebrate({
  [Segments.BODY]: Joi.object()
    .keys({
      name: Joi.string().min(2).max(30).required(),
      imageUrl: urlString.required(),
      weather: Joi.string().valid("hot", "warm", "cold").required(),
    })
    .required(),
});

const validateItemIdParam = celebrate({
  [Segments.PARAMS]: Joi.object()
    .keys({ itemId: objectId.required() })
    .required(),
});

module.exports = {
  // public
  validateSignin,
  validateSignup,

  // users
  validateUserIdParam,

  // items
  validateCreateItem,
  validateItemIdParam,
};

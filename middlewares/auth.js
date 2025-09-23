// middlewares/auth.js
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

module.exports = (req, res, next) => {
  const { authorization } = req.headers || {};

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const err = new Error("Authorization required");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }

  const token = authorization.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    const err = new Error("Authorization required");
    err.statusCode = UNAUTHORIZED;
    return next(err);
  }
};

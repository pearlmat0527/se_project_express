// middlewares/error-handler.js
const {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  // prefer explicit statusCode from custom AppError, else 500
  let status = err.statusCode || INTERNAL_SERVER_ERROR;

  // only map lib errors if no explicit custom status was provided
  if (!err.statusCode) {
    if (err.name === "ValidationError" || err.name === "CastError")
      status = BAD_REQUEST;
    else if (err.code === 11000) status = CONFLICT; // Mongo duplicate key
    else if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    )
      status = UNAUTHORIZED;
  }

  const defaultMessages = {
    [BAD_REQUEST]: "Invalid data",
    [UNAUTHORIZED]: "Authorization required",
    [FORBIDDEN]: "Forbidden",
    [NOT_FOUND]: "Requested resource not found",
    [CONFLICT]: "User with this email already exists",
    [INTERNAL_SERVER_ERROR]: "An error has occurred on the server.",
  };

  const message =
    (typeof err.message === "string" && err.message.trim()) ||
    defaultMessages[status] ||
    defaultMessages[INTERNAL_SERVER_ERROR];

  res.status(status).send({ message });
};

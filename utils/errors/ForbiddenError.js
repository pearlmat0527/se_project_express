// errors/ForbiddenError.js
const AppError = require("./AppError");

module.exports = class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
};

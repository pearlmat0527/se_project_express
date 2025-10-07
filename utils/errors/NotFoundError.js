// errors/NotFoundError.js
const AppError = require("./AppError");

module.exports = class NotFoundError extends AppError {
  constructor(message = "Requested resource not found") {
    super(message, 404);
  }
};

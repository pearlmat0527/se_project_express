const AppError = require("./AppError");

module.exports = class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
};

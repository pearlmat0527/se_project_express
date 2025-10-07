// errors/ConflictError.js
const AppError = require("./AppError");

module.exports = class ConflictError extends AppError {
  constructor(message = "User with this email already exists") {
    super(message, 409);
  }
};

const AppError = require("./AppError");

module.exports = class UnauthorizedError extends AppError {
  constructor(message = "Authorization required") {
    super(message, 401);
  }
};

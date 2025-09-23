// middlewares/logger.js
const winston = require("winston");
const expressWinston = require("express-winston");

// Compact console message: timestamp + message (or error stack)
const messageFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info) => {
    const { timestamp, level, message } = info;
    // express-winston attaches metadata on info.meta
    const stack =
      info?.meta?.error?.stack ||
      info?.error?.stack || // some versions put it here
      null;
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// --- helpers to keep sensitive data out of logs ---
const redactHeaders = (headers = {}) => {
  const h = { ...headers };
  if (h.authorization) h.authorization = "[REDACTED]";
  if (h.cookie) h.cookie = "[REDACTED]";
  return h;
};

const requestFilter = (req, propName) => {
  // Keep defaults, but scrub a few things just in case
  if (propName === "headers") return redactHeaders(req.headers);
  if (propName === "body" && req.body && typeof req.body === "object") {
    const clone = { ...req.body };
    if ("password" in clone) clone.password = "[REDACTED]";
    if ("token" in clone) clone.token = "[REDACTED]";
    return clone;
  }
  return req[propName];
};

// --- Request logger: logs every incoming request ---
const requestLogger = expressWinston.logger({
  // Nicely formatted "HTTP GET /path" message
  expressFormat: true, // uses morgan-style msg under the hood
  meta: true, // include req/res meta (headers, statusCode, responseTime, etc.)
  requestFilter, // scrub sensitive stuff
  transports: [
    // concise console
    new winston.transports.Console({ format: messageFormat }),
    // rich JSON file logs
    new winston.transports.File({
      filename: "request.log",
      format: winston.format.json(),
    }),
  ],
});

// --- Error logger: logs errors passed through middleware chain ---
const errorLogger = expressWinston.errorLogger({
  meta: true,
  requestFilter,
  transports: [
    new winston.transports.Console({ format: messageFormat }),
    new winston.transports.File({
      filename: "error.log",
      format: winston.format.json(),
    }),
  ],
});

module.exports = { requestLogger, errorLogger };

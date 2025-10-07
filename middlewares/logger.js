// middlewares/logger.js
const path = require("path");
const fs = require("fs");
const winston = require("winston");
const expressWinston = require("express-winston");

let DailyRotateFile;

try {
  // eslint-disable-next-line global-require, import/no-unresolved
  DailyRotateFile = require("winston-daily-rotate-file");
} catch (err) {
  // winston-daily-rotate-file is optional
  DailyRotateFile = null;
}

const LOG_DIR = path.join(process.cwd(), "logs");

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const isProd = process.env.NODE_ENV === "production";

// Console format: timestamp + message (or error stack). Color in dev.
const messageFormat = winston.format.combine(
  winston.format.timestamp(),
  isProd ? winston.format.uncolorize() : winston.format.colorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message } = info;
    const stack = info?.meta?.error?.stack || info?.error?.stack || null;
    return `${timestamp} ${level}: ${stack || message}`;
  })
);

// Redact sensitive bits
const redactHeaders = (headers = {}) => {
  const h = { ...headers };
  if (h.authorization) h.authorization = "[REDACTED]";
  if (h.cookie) h.cookie = "[REDACTED]";
  return h;
};

const requestFilter = (req, prop) => {
  if (prop === "headers") return redactHeaders(req.headers);
  if (prop === "body" && req.body && typeof req.body === "object") {
    const clone = { ...req.body };
    if ("password" in clone) clone.password = "[REDACTED]";
    if ("token" in clone) clone.token = "[REDACTED]";
    return clone;
  }
  return req[prop];
};

// Optional: enrich logs with requestId/userId if available
const dynamicMeta = (req) => ({
  requestId: req.headers["x-request-id"],
  userId: req.user?._id,
});

// Transports (rotate in prod, single file in dev)
const requestTransports = [
  new winston.transports.Console({ format: messageFormat }),
  DailyRotateFile && isProd
    ? new DailyRotateFile({
        dirname: LOG_DIR,
        filename: "request-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "14d",
        format: winston.format.json(),
      })
    : new winston.transports.File({
        filename: path.join(LOG_DIR, "request.log"),
        format: winston.format.json(),
      }),
].filter(Boolean);

const errorTransports = [
  new winston.transports.Console({ format: messageFormat }),
  DailyRotateFile && isProd
    ? new DailyRotateFile({
        dirname: LOG_DIR,
        filename: "error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
        format: winston.format.json(),
      })
    : new winston.transports.File({
        filename: path.join(LOG_DIR, "error.log"),
        format: winston.format.json(),
      }),
].filter(Boolean);

// Request logger
const requestLogger = expressWinston.logger({
  expressFormat: true,
  meta: true,
  requestFilter,
  statusLevels: true, // 4xx=warn, 5xx=error in console
  dynamicMeta,
  // ignoreRoute: (req) => req.path === '/health', // uncomment if desired
  transports: requestTransports,
});

// Error logger
const errorLogger = expressWinston.errorLogger({
  meta: true,
  requestFilter,
  dynamicMeta,
  transports: errorTransports,
});

module.exports = { requestLogger, errorLogger };

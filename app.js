// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { errors: celebrateErrors } = require("celebrate");

const { requestLogger, errorLogger } = require("./middlewares/logger");
const errorHandler = require("./middlewares/error-handler");
const NotFoundError = require("./utils/errors/NotFoundError");

const mainRouter = require("./routes/index"); // <-- Import main router
const User = require("./models/user");
const { PORT, MONGO_URI } = require("./utils/config");

const app = express();

// ----- Global middleware -----
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ----- All routing lives in routes/index.js -----
app.use("/", mainRouter); // <-- Single line for all routes

// ----- 404 catch-all -----
app.use((req, res, next) =>
  next(new NotFoundError("Requested resource not found"))
);

// ----- Error logging & handlers -----
app.use(errorLogger);
app.use(celebrateErrors());
app.use(errorHandler);

// ----- DB connect & start server -----
mongoose.set("autoIndex", true);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => User.init())
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`✅ Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("❌ DB / index init failed:", err);
    process.exit(1);
  });

module.exports = app;

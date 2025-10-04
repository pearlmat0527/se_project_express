// app.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const { errors: celebrateErrors } = require("celebrate");

const { requestLogger, errorLogger } = require("./middlewares/logger");
const auth = require("./middlewares/auth");
const errorHandler = require("./middlewares/error-handler");
const NotFoundError = require("./utils/errors/NotFoundError");

const { login, createUser } = require("./controllers/users");
const { getItems } = require("./controllers/clothingItems");
const usersRouter = require("./routes/users");
const clothingItemsRouter = require("./routes/clothingItems");

const User = require("./models/user");
const { PORT, MONGO_URI } = require("./utils/config");
const { validateSignin, validateSignup } = require("./middlewares/validators");

const app = express();

// ----- Global middleware -----
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ----- Public endpoints -----
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Crash test endpoint for code review
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.post("/signin", validateSignin, login);
app.post("/signup", validateSignup, createUser);
app.get("/items", getItems);

// ----- Auth gate (everything below is protected) -----
app.use(auth);

// ----- Protected routers -----
app.use("/items", clothingItemsRouter);
app.use("/users", usersRouter);

// ----- 404 catch-all (forward to centralized error handler) -----
app.use((req, res, next) =>
  next(new NotFoundError("Requested resource not found"))
);

app.use(errorLogger); // logs errors
app.use(celebrateErrors()); // celebrate/joi errors first
app.use(errorHandler); // centralized error handler last

mongoose.set("autoIndex", true);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => User.init()) // builds unique index on email
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB / index init failed:", err);
    process.exit(1);
  });

module.exports = app;

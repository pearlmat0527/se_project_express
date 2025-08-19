// app.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { login, createUser } = require("./controllers/users");
const { getItems } = require("./controllers/clothingItems");
const usersRouter = require("./routes/users");
const clothingItemsRouter = require("./routes/clothingItems");
const auth = require("./middlewares/auth");
const User = require("./models/user"); // <-- import to build indexes

const {
  BAD_REQUEST,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} = require("./utils/errors");

const app = express();
app.use(cors());
app.use(express.json());

// --- PUBLIC endpoints ---
app.post("/signin", login);
app.post("/signup", createUser);
app.get("/items", getItems); // public

// --- AUTH GATE ---
app.use(auth); // protects everything below

// --- PROTECTED routers ---
app.use("/items", clothingItemsRouter);
app.use("/users", usersRouter);

// --- 404 for unknown routes ---
app.use((req, res) =>
  res.status(404).send({ message: "Requested resource not found" })
);

// --- CENTRALIZED ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err);

  let status = err.statusCode || INTERNAL_SERVER_ERROR;

  if (err.name === "ValidationError" || err.name === "CastError")
    status = BAD_REQUEST;
  if (err.code === 11000) status = CONFLICT; // duplicate key (email)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
    status = UNAUTHORIZED;

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
});

// --- DB CONNECT & START SERVER *after* building indexes ---
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wtwr_db";

// ensure indexes are created in dev/test
mongoose.set("autoIndex", true);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => User.init()) // <-- builds the unique index on email
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

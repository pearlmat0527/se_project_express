const express = require("express");
const mongoose = require("mongoose");

const usersRouter = require("./routes/users");
const clothingItemsRouter = require("./routes/clothingItems");

const app = express();
app.use(express.json());

// TEMP auth stub so req.user._id exists (replace later with real auth)
app.use((req, res, next) => {
  req.user = { _id: "000000000000000000000001" }; // valid ObjectId
  next();
});

// Mount routers
app.use("/users", usersRouter);
app.use("/items", clothingItemsRouter);

// 404 for non-existent resources
app.use((req, res) => {
  res.status(404).send({ message: "Requested resource not found" });
});

// Central error handler (exact message required)
const { INTERNAL_SERVER_ERROR } = require("./utils/errors");
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err); // required: always log
  const status = err.statusCode || INTERNAL_SERVER_ERROR;
  if (status === INTERNAL_SERVER_ERROR) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occurred on the server" });
  }
  return res.status(status).send({ message: err.message });
});

const { MONGODB_URI = "mongodb://127.0.0.1:27017/wtwr", PORT = 3001 } =
  process.env;

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  })
  .catch((e) => {
    console.error("Mongo connection error:", e);
    process.exit(1);
  });

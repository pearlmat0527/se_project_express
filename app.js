// app.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { login, createUser } = require("./controllers/users");
const { getItems } = require("./controllers/clothingItems"); // for public GET /items
const usersRouter = require("./routes/users");
const clothingItemsRouter = require("./routes/clothingItems"); // ← correct file
const auth = require("./middlewares/auth");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wtwr", {
  autoIndex: true,
});

// --- PUBLIC endpoints ---
app.post("/signin", login);
app.post("/signup", createUser);
app.get("/items", getItems); // public

// --- AUTH GATE ---
// after public routes
app.use(auth);           // protects everything below


// Protected routers
app.use("/items", clothingItemsRouter); // create/delete/like/unlike protected
app.use("/users", usersRouter);

app.use((req, res) => res.status(404).send({ message: "Route not found" }));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
module.exports = app;

// utils/config.js
require("dotenv").config(); // load .env from project root

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/wtwr_db";
const JWT_SECRET = process.env.JWT_SECRET || "super-strong-secret";

// guardrail so we don't boot without a DB URI
if (!MONGO_URI || typeof MONGO_URI !== "string") {
  // eslint-disable-next-line no-console
  console.error("❌ Missing MONGO_URI. Create a .env at the project root.");
  process.exit(1);
}

module.exports = { PORT, MONGO_URI, JWT_SECRET };

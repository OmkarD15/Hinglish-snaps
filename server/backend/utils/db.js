const mongoose = require("mongoose");

const URI = process.env.MONGODB_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connection successful to DB");
  } catch (error) {
    console.error("Database connection failed:", error);
    // ✅ 2. Use a non-zero exit code to indicate a fatal error
    process.exit(1);
  }
};

module.exports = connectDb;
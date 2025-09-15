const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // ✅ 1. Added unique constraint for database-level validation
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  // ✅ 2. Added 'next' to the function signature
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const saltRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, saltRound);
    this.password = hashedPassword;
    // ✅ 3. Fixed the critical bug by adding the missing next() call
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to generate JWT
userSchema.methods.generateToken = function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        isAdmin: this.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30d",
      }
    );
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Token could not be generated");
  }
};

// ✅ 4. Corrected model name to standard convention
const User = mongoose.model("User", userSchema);

module.exports = User;
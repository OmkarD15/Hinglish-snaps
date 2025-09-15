const jwt = require("jsonwebtoken");
// ✅ 1. Corrected the import path to be relative
const User = require("../models/user-model");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized HTTP, Token not provided" });
  }

  const jwtToken = token.replace("Bearer", "").trim();

  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userData = await User.findOne({ email: isVerified.email }).select({
      password: 0,
    });

    // ✅ 2. Added a check to ensure the user exists in the database
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    req.token = token;
    req.user = userData;
    // ✅ 3. Corrected the critical typo from `user._id` to `userData._id`
    req.userID = userData._id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = authMiddleware;
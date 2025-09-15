// ✅ 1. Corrected the import path to be relative
const User = require("../models/user-model");

// *-------------------
// Home Logic
// *-------------------
const home = async (req, res) => {
  try {
    res.status(200).send({ msg: "Welcome to our home page" });
  } catch (error) {
    console.log(error);
  }
};

// *-------------------
// Registration Logic
// *-------------------
const register = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userCreated = await User.create({ username, email, phone, password });

    res.status(201).json({
      message: "Registration Successful",
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    // ✅ 2. Improved error handling to use the central error middleware
    next(error);
  }
};

// *-------------------------------
//* User Login Logic
// *-------------------------------
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (!userExist) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await userExist.comparePassword(password);

    if (isPasswordValid) {
      res.status(200).json({
        message: "Login Successful",
        token: await userExist.generateToken(),
        userId: userExist._id.toString(),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    // ✅ 2. Improved error handling
    next(error);
  }
};

// *-------------------------------
// Get User Data Logic (after authentication)
// *-------------------------------
const user = async (req, res) => {
  try {
    // The user data is attached to the request object by the authMiddleware
    const userData = req.user;
    return res.status(200).json(userData);
  } catch (error) {
    console.log(`Error from the user route: ${error}`);
  }
};

module.exports = { home, register, login, user };
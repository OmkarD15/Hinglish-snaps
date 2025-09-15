const express = require("express");
const router = express.Router();

// ✅ 1. Corrected all absolute file paths to be relative
const authControllers = require("../controllers/auth-controller");
const signupSchema = require("../validators/auth-validation");
const validate = require("../middlewares/validate-middleware");
const authMiddleware = require("../middlewares/auth-middleware");


// ✅ 2. Defined each route only once for clarity and correct functionality
router.route("/").get(authControllers.home);

router.route("/register").post(validate(signupSchema), authControllers.register);

router.route("/login").post(authControllers.login);

router.route("/user").get(authMiddleware, authControllers.user);

// ❌ 3. Removed all incorrect and duplicate route definitions that were here.

module.exports = router;
const express = require("express");
const router = express.Router();

// ✅ FIX: Corrected the import path to be relative
const contactForm = require("../controllers/contact-controller");

router.route("/contact").post(contactForm);

module.exports = router;
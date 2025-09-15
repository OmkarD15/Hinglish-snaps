// ✅ 1. Corrected the import path to be relative
const Contact = require("../models/contact-model");

const contactForm = async (req, res, next) => {
  try {
    const response = req.body;
    await Contact.create(response);
    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    // ✅ 2. Improved error handling to use the central error middleware
    next(error);
  }
};

module.exports = contactForm;
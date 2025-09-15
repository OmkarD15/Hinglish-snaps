const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body); // Validate the request body
      next(); // Proceed if validation passes
    } catch (err) {
      // Return detailed validation error messages
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors.map((error) => error.message),
      });
    }
  };
};

module.exports = validate;

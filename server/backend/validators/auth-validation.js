const { z } = require("zod");

// Creating an object schema
const signupSchema = z.object({
  username: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(25, { message: "Name must not be more than 25 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(3, { message: "Email must be at least 3 characters" })
    .max(50, { message: "Email must not be more than 50 characters" }),
  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .min(10, { message: "Phone must be exactly 10 characters" })
    .max(10, { message: "Phone must be exactly 10 characters" }),
  password: z
    .string({ required_error: "Password is required" })
    // ✅ FIX: Corrected the error message to match the rule (min 7 characters).
    .min(7, { message: "Password must be at least 7 characters" })
    .max(20, { message: "Password can't be greater than 20 characters" }),
});

module.exports = signupSchema;
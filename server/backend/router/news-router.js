const express = require("express");
const News = require("../models/news-model.js");
const router = express.Router();

// GET /api/news?category=finance
// Serves pre-processed news from the database for a specific category.
router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "finance"; // Default to finance
    const articles = await News.find({ category })
      .sort({ publishedAt: -1 })
      .limit(10);
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch news from database." });
  }
});

module.exports = router;
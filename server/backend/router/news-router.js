const express = require("express");
const News = require("../models/news-model.js");
const router = express.Router();

// GET /api/news?category=finance&page=1&limit=6&search=keyword
// Serves pre-processed news from the database with pagination and search support.
router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "finance"; // Default to finance
    const page = Math.max(1, parseInt(req.query.page) || 1); // Default page 1
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 6)); // Default 6, max 50
    const search = req.query.search?.trim() || "";

    // Build query filter. If client passes category='all', do not filter by category (search across all categories).
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Add search filter if search term provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { hinglishSummary: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await News.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch articles with pagination
    const articles = await News.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      articles,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Error fetching news:", error.message);
    res.status(500).json({ message: "Failed to fetch news from database." });
  }
});

module.exports = router;

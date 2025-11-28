const express = require("express");
const fetch = require("node-fetch");
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

    // If a search term is provided, query the external NewsAPI (global search)
    if (search) {
      try {
        // If category specified and not 'all', append it to the query to bias results
        const extra = category && category !== 'all' ? ` AND ${category}` : '';
        const q = encodeURIComponent(`${search}${extra}`);
        const url = `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=${limit}&page=${page}&apiKey=${process.env.NEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'error') {
          console.error('NewsAPI error:', data.message);
          return res.status(502).json({ message: 'Failed to fetch from NewsAPI', error: data.message });
        }

        const mapped = (data.articles || []).map((a) => ({
          title: a.title,
          url: a.url,
          image: a.urlToImage,
          hinglishSummary: a.description || a.content || "",
          source: a.source?.name,
          publishedAt: a.publishedAt,
          category: category && category !== 'all' ? category : 'all',
          isFallback: true,
        }));

        const totalResults = data.totalResults || mapped.length;
        const totalPages = Math.ceil(totalResults / limit);

        return res.status(200).json({
          articles: mapped,
          total: totalResults,
          page,
          totalPages,
          hasMore: page < totalPages,
        });
      } catch (err) {
        console.error('Error querying NewsAPI:', err.message);
        return res.status(500).json({ message: 'Failed to fetch news from external API.' });
      }
    }

    // Add search filter if search term provided (DB fallback)
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

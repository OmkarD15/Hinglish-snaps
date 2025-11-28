const express = require("express");
const fetch = require("node-fetch");
const News = require("../models/news-model.js");
const router = express.Router();

// GET /api/news?category=finance&page=1&limit=6&search=keyword
// Serves news from database (if no search) or external NewsAPI (if search provided)
router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "finance";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 6));
    const search = req.query.search?.trim() || "";

    // If search term provided, query NewsAPI globally
    if (search) {
      try {
        const extra = category && category !== 'all' ? ` AND ${category}` : '';
        const q = encodeURIComponent(`${search}${extra}`);
        const url = `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=${limit}&page=${page}&apiKey=${process.env.NEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'error') {
          console.error('NewsAPI error:', data.message);
          return res.status(502).json({ message: 'NewsAPI error', error: data.message });
        }

        const articles = (data.articles || []).map((a) => ({
          title: a.title,
          url: a.url,
          image: a.urlToImage,
          hinglishSummary: a.description || a.content || "(No summary available)",
          source: a.source?.name,
          publishedAt: a.publishedAt,
          category: 'search',
          isFallback: true,
        }));

        const totalResults = data.totalResults || 0;
        const totalPages = Math.ceil(totalResults / limit);

        return res.status(200).json({
          articles,
          total: totalResults,
          page,
          totalPages,
          hasMore: page < totalPages,
        });
      } catch (err) {
        console.error('Error querying NewsAPI:', err.message);
        return res.status(500).json({ message: 'Failed to fetch from NewsAPI.' });
      }
    }

    // No search: query database
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const total = await News.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

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
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

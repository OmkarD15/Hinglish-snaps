const express = require("express");
const fetch = require("node-fetch");
const News = require("../models/news-model.js");
const { convertToHinglish } = require("../utils/hinglish-converter.js");
const router = express.Router();

// GET /api/news?category=finance&page=1&limit=6&search=keyword
// Serves news from database (if no search) or external NewsAPI (if search provided)
router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "finance";
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 6));
    const search = req.query.search?.trim() || "";
    const convert = (req.query.convert === 'true' || req.query.convert === '1');

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

        let articles = (data.articles || []).map((a) => ({
          title: a.title,
          url: a.url,
          image: a.urlToImage,
          hinglishSummary: a.description || a.content || "(No summary available)",
          source: a.source?.name,
          publishedAt: a.publishedAt,
          category: 'search',
          isFallback: true,
        }));

        // If client requested on-the-fly conversion for this page only
        if (convert && articles.length > 0) {
          try {
            // Convert concurrently but await all to finish for this page
            const converted = await Promise.all(articles.map(async (art) => {
              try {
                const conv = await convertToHinglish(art.title, art.hinglishSummary || '');
                return { ...art, hinglishSummary: conv, isFallback: false };
              } catch (err) {
                // conversion failed for this article: keep fallback
                console.error('Conversion error for article:', art.title, err.message);
                return art;
              }
            }));
            articles = converted;
          } catch (err) {
            console.error('Page conversion failed:', err.message);
            // continue with unconverted articles
          }
        }

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

    let articles = await News.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // If client requested on-the-fly conversion for this page only,
    // convert any items that are marked as fallback or missing hinglishSummary.
    if (convert && articles.length > 0) {
      try {
        const converted = await Promise.all(articles.map(async (art) => {
          if (art.hinglishSummary && !art.isFallback) return art; // already converted
          try {
            const conv = await convertToHinglish(art.title, art.hinglishSummary || '');
            art.hinglishSummary = conv;
            art.isFallback = false;
            // Save the converted summary back to DB to cache for future
            await art.save();
            return art;
          } catch (err) {
            console.error('Conversion failed for DB article:', art.title, err.message);
            return art;
          }
        }));
        articles = converted;
      } catch (err) {
        console.error('Error converting DB page:', err.message);
      }
    }

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

// POST /api/news/convert
// Body: { url, title, description, image?, source?, publishedAt? }
// Converts a single article to Hinglish on-demand and caches it in the News collection.
router.post('/convert', async (req, res) => {
  try {
    const { url, title, description, image, source, publishedAt } = req.body || {};
    if (!url || !title) return res.status(400).json({ message: 'Missing required fields: url and title' });

    // If we already have a non-fallback Hinglish summary cached, return it
    try {
      const existing = await News.findOne({ url });
      if (existing && existing.hinglishSummary && !existing.isFallback) {
        return res.status(200).json({ hinglishSummary: existing.hinglishSummary, cached: true });
      }
    } catch (err) {
      console.warn('Warning: failed to check existing cache:', err.message);
    }

    // Convert on-demand (synchronous for the request)
    let hinglishSummary;
    try {
      hinglishSummary = await convertToHinglish(title, description || '');
    } catch (err) {
      console.error('Conversion failed:', err.message);
      return res.status(502).json({ message: 'Conversion failed', error: err.message });
    }

    // Upsert into News collection as a cached converted result
    const doc = await News.findOneAndUpdate(
      { url },
      {
        $set: {
          title,
          url,
          image: image || undefined,
          hinglishSummary,
          source: source || undefined,
          publishedAt: publishedAt ? new Date(publishedAt) : undefined,
          category: 'search',
          isFallback: false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ hinglishSummary: doc.hinglishSummary, cached: false });
  } catch (error) {
    console.error('Error in /api/news/convert:', error.message);
    return res.status(500).json({ message: 'Server error during conversion.' });
  }
});

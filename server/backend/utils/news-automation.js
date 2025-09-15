const fetch = require("node-fetch");
const News = require("../models/news-model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Updated the list to only include your chosen categories
const CATEGORIES = ["finance", "technology", "business"];

const fetchAndStoreNews = async () => {
  console.log("📰 Cron Job: Fetching fresh news for selected categories...");
  
  for (const category of CATEGORIES) {
    try {
      const query = encodeURIComponent(`india AND ${category}`);
      const url = `https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "error") {
        console.error(`❌ NewsAPI Error for category "${category}":`, data.message);
        continue;
      }
      if (!data.articles || data.articles.length === 0) {
        console.log(`No new articles found for category: ${category}`);
        continue;
      }

      let newArticlesSaved = 0;
      for (const article of data.articles) {
        if (!article.url || (await News.findOne({ url: article.url })) || !article.title || !article.description) {
          continue;
        }

        let hinglishSummary;
        let isFallback = false;

        try {
          const prompt = `Summarize this news in 50-60 words in natural, engaging Hinglish (Roman Hindi + English mix). Preserve names and technical terms. News: "${article.title}. ${article.description}"`;
          const result = await model.generateContent(prompt);
          hinglishSummary = result.response.text().trim();
        } catch (error) {
          console.error(`Gemini failed for "${article.title}". Using fallback. Error: ${error.message}`);
          hinglishSummary = (article.description || "").substring(0, 200) + "...";
          isFallback = true;
        }

        await News.create({
          title: article.title,
          url: article.url,
          image: article.urlToImage,
          hinglishSummary,
          source: article.source.name,
          publishedAt: article.publishedAt,
          category: category,
          isFallback,
          retryCount: isFallback ? 1 : 0,
        });
        newArticlesSaved++;
      }
      if (newArticlesSaved > 0) {
        console.log(`✅ Success! Saved ${newArticlesSaved} new articles for category: ${category}.`);
      }
    } catch (error) {
      console.error(`❌ Error during fetching process for category "${category}":`, error.message);
    }
  }
  console.log("✅ Cron Job: Finished processing all categories.");
};

const retryFailedSummaries = async () => {
    // ... same retry code as before ...
};

module.exports = { fetchAndStoreNews, retryFailedSummaries };
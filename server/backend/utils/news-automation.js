const fetch = require("node-fetch");
const News = require("../models/news-model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ FIX 1: Use the correct, stable model name
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const CATEGORIES = ["finance", "technology", "business"];

// ✅ FIX 2: Increase this temporarily to 10 so it retries your existing failed articles
const MAX_RETRY_COUNT = 10;

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
  console.log("♻️ Cron Job: Retrying failed Hinglish summaries...");

  try {
    // Finds articles that failed previously (retryCount < 10)
    const articlesNeedingRetry = await News.find({
      isFallback: true,
      retryCount: { $lt: MAX_RETRY_COUNT },
    })
      .sort({ createdAt: 1 })
      .limit(25);

    if (!articlesNeedingRetry.length) {
      console.log("ℹ️ No fallback summaries to retry right now.");
      return;
    }

    for (const article of articlesNeedingRetry) {
      try {
        console.log(`Attempting to convert: "${article.title}"`); // Added log to see progress
        
        const prompt = `Convert the following news into a 50-60 word natural, engaging Hinglish summary (Roman Hindi + English mix). Preserve key names and technical terms. News: "${article.title}. ${article.hinglishSummary}"`;

        const result = await model.generateContent(prompt);
        const newSummary = result.response.text().trim();

        article.hinglishSummary = newSummary;
        article.isFallback = false;
        // Reset retry count on success so it looks clean
        article.retryCount = 0; 
        await article.save();

        console.log(`✅ Successfully updated Hinglish summary for: ${article.title}`);
      } catch (error) {
        article.retryCount = article.retryCount + 1;
        await article.save();
        console.error(`❌ Retry failed for "${article.title}":`, error.message);
      }
    }

    console.log("✅ Cron Job: Finished retrying failed summaries.");
  } catch (error) {
    console.error("❌ Error inside retryFailedSummaries job:", error.message);
  }
};

module.exports = { fetchAndStoreNews, retryFailedSummaries };
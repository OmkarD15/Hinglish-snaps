const fetch = require("node-fetch");
const News = require("../models/news-model.js");
const { convertToHinglish } = require("./hinglish-converter.js");

const CATEGORIES = ["finance", "technology", "business"];
const MAX_RETRY_COUNT = 10;

// ✅ Improved Prompt Function for Consistent Style
const getHinglishPrompt = (text) => {
  return `
  Task: Summarize this news in casual "Hinglish" (Hindi written in English script).
  
  Strict Rules:
  1. Script: Use ONLY the English alphabet. NO Devanagari script.
  2. Tone: Casual, layman, conversational (like talking to a friend).
  3. Style: Use simple English for technical terms, but Hindi grammar/fillers.
     - Bad: "Vartamaan mein sthiti gambhir hai." (Too formal)
     - Good: "Abhi situation thodi serious hai boss." (Perfect layman style)
  4. Length: Keep it under 60 words.
  
  News to summarize: "${text}"
  `;
};

const fetchAndStoreNews = async () => {
  console.log("📰 Cron Job: Fetching fresh news for selected categories...");
  
  for (const category of CATEGORIES) {
    try {
      const query = encodeURIComponent(`india AND ${category}`);
      const url = `https://newsapi.org/v2/everything?q=${query}&language=en&pageSize=50&apiKey=${process.env.NEWS_API_KEY}`;
      
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
          const prompt = getHinglishPrompt(`${article.title}. ${article.description}`);
          
          // ✅ Use shared converter helper
          hinglishSummary = await convertToHinglish(article.title, article.description);
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
        // Use the same improved prompt for retries
        const prompt = getHinglishPrompt(`${article.title}. ${article.hinglishSummary}`);

        // ✅ Use shared converter helper
        const newSummary = await convertToHinglish(article.title, article.hinglishSummary);

        article.hinglishSummary = newSummary;
        article.isFallback = false;
        article.retryCount = article.retryCount + 1;
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
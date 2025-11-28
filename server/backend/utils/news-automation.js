const fetch = require("node-fetch");
const News = require("../models/news-model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Updated the list to only include your chosen categories
const CATEGORIES = ["finance", "technology", "business"];

// ✅ Limit how many times we retry Gemini for the same article
const MAX_RETRY_COUNT = 3;

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

// ✅ Retry Gemini for articles where we previously used a fallback English summary
const retryFailedSummaries = async () => {
  console.log("♻️ Cron Job: Retrying failed Hinglish summaries...");

  try {
    // Find articles where we are still using a fallback summary and
    // haven't exceeded the maximum retry count.
    const articlesNeedingRetry = await News.find({
      isFallback: true,
      retryCount: { $lt: MAX_RETRY_COUNT },
    })
      .sort({ createdAt: 1 })
      .limit(25); // safety limit per run

    if (!articlesNeedingRetry.length) {
      console.log("ℹ️ No fallback summaries to retry right now.");
      return;
    }

    for (const article of articlesNeedingRetry) {
      try {
        // We only have the title + the existing (English) fallback summary,
        // so we ask Gemini to turn that into a Hinglish summary.
        const prompt = `Convert the following news into a 50-60 word natural, engaging Hinglish summary (Roman Hindi + English mix). Preserve key names and technical terms. News: "${article.title}. ${article.hinglishSummary}"`;

        const result = await model.generateContent(prompt);
        const newSummary = result.response.text().trim();

        article.hinglishSummary = newSummary;
        article.isFallback = false; // no longer using fallback
        article.retryCount = article.retryCount + 1;
        await article.save();

        console.log(`✅ Successfully updated Hinglish summary for: ${article.title}`);
      } catch (error) {
        // On failure, just bump retryCount so we don't loop forever.
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

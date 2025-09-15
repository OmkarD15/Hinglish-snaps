const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    image: { type: String },
    hinglishSummary: { type: String, required: true },
    source: { type: String },
    publishedAt: { type: Date },
    category: { type: String, required: true, index: true },
    // ✅ Flag to know if we are showing a fallback English summary
    isFallback: { type: Boolean, default: false },
    // ✅ Counter to prevent infinite retries
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ MongoDB will automatically delete documents 24 hours after they are created.
newsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

const News = mongoose.model("News", newsSchema);
module.exports = News;
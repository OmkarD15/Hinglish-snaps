const mongoose = require("mongoose");

const conversionQueueSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    source: { type: String },
    publishedAt: { type: Date },
    status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    hinglishSummary: { type: String },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Expire documents after 7 days to clean up completed conversions
conversionQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const ConversionQueue = mongoose.model("ConversionQueue", conversionQueueSchema);
module.exports = ConversionQueue;

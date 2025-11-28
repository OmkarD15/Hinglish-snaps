const ConversionQueue = require("../models/conversion-queue-model.js");
const { convertToHinglish } = require("./hinglish-converter.js");

const MAX_RETRY_COUNT = 3;

// ✅ Worker function: process pending conversions in the queue
const processConversionQueue = async () => {
  try {
    // Find up to 5 pending items
    const pending = await ConversionQueue.find({
      status: "pending",
      retryCount: { $lt: MAX_RETRY_COUNT },
    })
      .sort({ createdAt: 1 })
      .limit(5);

    if (pending.length === 0) {
      return; // No work to do
    }

    for (const item of pending) {
      try {
        // Mark as processing
        item.status = "processing";
        await item.save();

        // Convert to Hinglish
        const hinglishSummary = await convertToHinglish(item.title, item.description || "");
        
        // Mark as completed
        item.hinglishSummary = hinglishSummary;
        item.status = "completed";
        item.error = null;
        await item.save();

        console.log(`✅ Hinglish conversion completed for: ${item.title.substring(0, 50)}...`);
      } catch (error) {
        item.retryCount += 1;
        if (item.retryCount >= MAX_RETRY_COUNT) {
          item.status = "failed";
          item.error = error.message;
          console.error(`❌ Conversion failed (max retries) for: ${item.title.substring(0, 50)}...`);
        } else {
          item.status = "pending";
          console.warn(`⚠️ Conversion retry ${item.retryCount} for: ${item.title.substring(0, 50)}...`);
        }
        await item.save();
      }
    }
  } catch (error) {
    console.error("❌ Error in processConversionQueue:", error.message);
  }
};

// ✅ Enqueue an article for Hinglish conversion
const enqueueForConversion = async (url, title, description, source, publishedAt) => {
  try {
    // Check if already in queue or completed
    const existing = await ConversionQueue.findOne({ url });
    if (existing) {
      return existing; // Already queued or completed
    }

    // Add to queue
    const queueItem = await ConversionQueue.create({
      url,
      title,
      description: (description || "").substring(0, 500), // Truncate for storage
      source,
      publishedAt,
      status: "pending",
    });

    console.log(`📋 Enqueued for conversion: ${title.substring(0, 50)}...`);
    return queueItem;
  } catch (error) {
    console.error(`❌ Error enqueueing for conversion: ${error.message}`);
  }
};

// ✅ Get Hinglish summary if available, otherwise return English description
const getHinglishOrFallback = async (url, fallbackDescription) => {
  try {
    const item = await ConversionQueue.findOne({ url });
    if (item && item.status === "completed" && item.hinglishSummary) {
      return item.hinglishSummary; // Return converted Hinglish
    }
  } catch (error) {
    console.error(`Error fetching Hinglish summary: ${error.message}`);
  }
  return fallbackDescription; // Return English fallback
};

module.exports = { processConversionQueue, enqueueForConversion, getHinglishOrFallback };

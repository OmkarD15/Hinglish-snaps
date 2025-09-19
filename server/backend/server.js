require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron"); // ✅ 1. Imported node-cron for scheduling
const app = express();

// ✅ 2. Fixed absolute paths to be relative for portability
const connectDb = require("./utils/db");
const authRouter = require("./router/auth-router");
const contactRouter = require("./router/contact-router");
const errorMiddleware = require("./middlewares/error-middleware");

// ✅ 3. Imported the new news router and automation functions
const newsRouter = require("./router/news-router");
const { fetchAndStoreNews, retryFailedSummaries } = require("./utils/news-automation");

// Middleware
app.use(cors({
  origin: "https://hinglish-snaps-mte7.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/form", contactRouter);
app.use("/api/news", newsRouter); // ✅ 4. Registered the new /api/news route

// Error Handling
app.use(errorMiddleware);

const PORT = 5000;

// Connect to the database and start the server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at port: ${PORT}`);
    // ✅ 5. Added an initial news fetch on server startup
    fetchAndStoreNews();
  });
});

// ✅ 6. Scheduled the automation jobs
// Run the main job every hour to get fresh news.
cron.schedule("0 * * * *", fetchAndStoreNews);
// Run the retry job every 10 minutes to fix fallbacks.
cron.schedule("*/10 * * * *", retryFailedSummaries);
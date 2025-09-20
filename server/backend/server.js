require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const app = express();

const connectDb = require("./utils/db");
const authRouter = require("./router/auth-router");
const contactRouter = require("./router/contact-router");
const errorMiddleware = require("./middlewares/error-middleware");
const newsRouter = require("./router/news-router");
const { fetchAndStoreNews, retryFailedSummaries } = require("./utils/news-automation");

// ✅ FIX: Allow multiple specific URLs to make requests
const corsOptions = {
  origin: [
    "http://localhost:5173", // For local development
    "https://hinglish-snaps-mte7.vercel.app", // Your old URL
    "https://hinglish-snaps-ng9mpb1ey-omkars-projects-7307657a.vercel.app", // Your new URL
    // You can add your main production URL here later too
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/form", contactRouter);
app.use("/api/news", newsRouter);

// Error Handling
app.use(errorMiddleware);

const PORT = 5000;

// Connect to the database and start the server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at port: ${PORT}`);
    fetchAndStoreNews();
  });
});

// Scheduled the automation jobs
cron.schedule("0 * * * *", fetchAndStoreNews);
cron.schedule("*/10 * * * *", retryFailedSummaries);
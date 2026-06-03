import express from "express";
import dotenv from "dotenv";
import { corsMiddleware } from "./configs/cors.js";
import { helmetMiddleware } from "./configs/security.js";
import { logger } from "./configs/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./configs/rateLimit.js";
import authRoutes from "./routes/auth.js";
import storyRoutes from "./routes/story.js";
import storyViewRoutes from "./routes/storyView.js";

// Chạy job dọn story hết hạn mỗi ngày
import "./utils/cleanupJob.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(logger);
app.use(express.json());

// Routes
app.use(apiLimiter);
app.use("/auth", authRoutes);
app.use("/stories", storyRoutes);
app.use("/story-view", storyViewRoutes);

app.use(errorHandler);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

export default app;

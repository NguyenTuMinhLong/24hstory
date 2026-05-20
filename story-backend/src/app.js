import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import authRoutes from "./routes/auth.js";
import storyRoutes from "./routes/story.js";

app.use("/auth", authRoutes);
app.use("/stories", storyRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
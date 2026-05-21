import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

import storyRoutes from "./routes/story.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/stories", storyRoutes);
app.use("/auth", authRoutes)

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});
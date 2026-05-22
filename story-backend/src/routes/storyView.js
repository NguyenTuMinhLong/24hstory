import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { markSeenController, getViewersController, getMySeenStoriesController } from "../controllers/storyViewController.js";

const router = express.Router();

router.post("/seen/:storyId", authMiddleware, markSeenController);
router.get("/viewers/:storyId", authMiddleware, getViewersController);
router.get("/my-views", authMiddleware, getMySeenStoriesController);

export default router;
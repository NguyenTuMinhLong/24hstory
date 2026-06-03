import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { markSeenController, getViewersController, getMySeenStoriesController } from "../controllers/storyViewController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { storyIdSchema } from "../validators/storyValidator.js";

const router = express.Router();

router.post("/seen/:storyId", authMiddleware, validateRequest(storyIdSchema, "params"), markSeenController);
router.get("/viewers/:storyId", authMiddleware, validateRequest(storyIdSchema, "params"), getViewersController);
router.get("/my-views", authMiddleware, getMySeenStoriesController);

export default router;

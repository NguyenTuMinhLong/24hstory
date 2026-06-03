import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { createStoryController, getActiveStoriesController, getMyStoriesController, getStoryByIdController, deleteStoryController } from "../controllers/storyController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { storyIdSchema } from "../validators/storyValidator.js";
import { storyCreationLimiter } from "../configs/rateLimit.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/", authMiddleware, storyCreationLimiter, upload.single("media"), createStoryController);
router.get("/me", authMiddleware, getMyStoriesController);
router.get("/", authMiddleware, getActiveStoriesController);
router.get("/:storyId", authMiddleware, validateRequest(storyIdSchema, "params"), getStoryByIdController);
router.delete("/:storyId", authMiddleware, validateRequest(storyIdSchema, "params"), deleteStoryController);

export default router;

import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { createStoryController, getActiveStoriesController, getMyStoriesController, getStoryByIdController, deleteStoryController } from "../controllers/storyController.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" }); // lưu tạm local

router.post("/", authMiddleware, upload.single("media"), createStoryController);
router.get("/me", authMiddleware, getMyStoriesController);
router.get("/:storyId", authMiddleware, getStoryByIdController);
router.get("/", authMiddleware, getActiveStoriesController);
router.delete("/:storyId", authMiddleware, deleteStoryController);

export default router;
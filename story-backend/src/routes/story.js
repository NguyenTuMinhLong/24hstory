import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { createStoryController, getActiveStoriesController, deleteStoryController } from "../controllers/storyController.js";


const router = express.Router();
const upload = multer({ dest: "tmp/" }); // lưu tạm local

router.post("/", authMiddleware, upload.single("media"), createStoryController);
router.get("/", authMiddleware, getActiveStoriesController);
router.delete("/:storyId", authMiddleware, deleteStoryController);

export default router;
import express from "express";
import multer from "multer";
import {
    registerController,
    loginController,
    updateAvatarController,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/register", registerController);
router.post("/login", loginController);
router.patch("/avatar", authMiddleware, upload.single("avatar"), updateAvatarController);

export default router;
import express from "express";
import multer from "multer";
import {
    registerController,
    loginController,
    updateAvatarController,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerSchema, LoginSchema } from "../validators/authValidator.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/register", validateRequest(registerSchema), registerController);
router.post("/login", validateRequest(LoginSchema), loginController);
router.patch("/avatar", authMiddleware, upload.single("avatar"), updateAvatarController);

export default router;
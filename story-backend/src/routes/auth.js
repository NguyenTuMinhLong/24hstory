import express from "express";
import multer from "multer";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  logoutAllController,
  meController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  updateAvatarController,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { registerSchema, loginSchema, refreshSchema, resetPasswordSchema, changePasswordSchema } from "../validators/authValidator.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post("/register", validateRequest(registerSchema), registerController);
router.post("/login", validateRequest(loginSchema), loginController);
router.post("/refresh", validateRequest(refreshSchema), refreshController);
router.post("/logout", logoutController);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPasswordController);

router.get("/me", authMiddleware, meController);
router.post("/logout-all", authMiddleware, logoutAllController);
router.patch("/password", authMiddleware, validateRequest(changePasswordSchema), changePasswordController);
router.patch("/avatar", authMiddleware, upload.single("avatar"), updateAvatarController);

export default router;

import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/authValidator.js";
import { uploadAvatarMiddleware } from "../configs/multer.js";
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

const router = express.Router();

// Public routes
router.post("/register", validateRequest(registerSchema), registerController);
router.post("/login", validateRequest(loginSchema), loginController);
router.post("/refresh", validateRequest(refreshSchema), refreshController);
router.post("/logout", logoutController);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPasswordController);

// Protected routes
router.get("/me", authMiddleware, meController);
router.post("/logout-all", authMiddleware, logoutAllController);
router.patch("/password", authMiddleware, validateRequest(changePasswordSchema), changePasswordController);
router.patch("/avatar", authMiddleware, uploadAvatarMiddleware.single("avatar"), updateAvatarController);

export default router;

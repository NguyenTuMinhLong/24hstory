import rateLimit from "express-rate-limit";

// Giới hạn đăng nhập: 5 lần / 1 phút
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Giới hạn API: 100 request / 1 phút
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Giới hạn tạo story: 10 story / 1 giờ
export const storyCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Story creation limit reached. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

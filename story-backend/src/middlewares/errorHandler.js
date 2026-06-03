import { AppError } from "../utils/errors.js";

export const errorHandler = (err, req, res, next) => {
  // Log lỗi ra console để debug
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Lỗi do ứng dụng tự throw (operational error)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Lỗi trùng unique field của Prisma
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  // Lỗi không tìm thấy record
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // Lỗi JWT không hợp lệ
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Lỗi JWT hết hạn
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Lỗi file quá lớn (multer)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large",
    });
  }

  // Lỗi sai định dạng file
  if (err.message === "Invalid file type") {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Allowed: jpeg, png, mp4",
    });
  }

  // Lỗi server không xác định
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
  });
};

// Wrapper để handle async function tự động catch lỗi
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../prismaClient.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";

// Tạo access token (hết hạn sau 15 phút)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

// Tạo refresh token (hết hạn sau 7 ngày) - lưu vào database
export const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

// Kiểm tra refresh token còn valid không
export const verifyRefreshToken = async (token) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) throw new Error("Token not found");
  if (storedToken.isRevoked) throw new Error("Token revoked");
  if (storedToken.expiresAt < new Date()) throw new Error("Token expired");

  return storedToken;
};

// Thu hồi một refresh token
export const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.update({
    where: { token },
    data: { isRevoked: true },
  });
};

// Thu hồi tất cả refresh token của user
export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
};

// Xóa tất cả session của user
export const revokeAllUserSessions = async (userId) => {
  await prisma.session.deleteMany({ where: { userId } });
};

// Tạo token ngẫu nhiên cho xác thực email
export const generateEmailVerificationToken = () => crypto.randomBytes(32).toString("hex");

// Tạo token ngẫu nhiên cho reset password
export const generatePasswordResetToken = () => crypto.randomBytes(32).toString("hex");

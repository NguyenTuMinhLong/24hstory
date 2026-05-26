import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../prismaClient.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

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

export const verifyRefreshToken = async (token) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) throw new Error("Token not found");
  if (storedToken.isRevoked) throw new Error("Token revoked");
  if (storedToken.expiresAt < new Date()) throw new Error("Token expired");

  return storedToken;
};

export const revokeRefreshToken = async (token) => {
  await prisma.refreshToken.update({
    where: { token },
    data: { isRevoked: true },
  });
};

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
};

export const revokeAllUserSessions = async (userId) => {
  await prisma.session.deleteMany({ where: { userId } });
};

export const generateEmailVerificationToken = () => crypto.randomBytes(32).toString("hex");
export const generatePasswordResetToken = () => crypto.randomBytes(32).toString("hex");

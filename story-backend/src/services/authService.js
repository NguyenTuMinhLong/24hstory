import bcrypt from "bcrypt";
import cloudinary from "../configs/cloudinary.js";
import fs from "fs";
import { prisma } from "../prismaClient.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from "./tokenService.js";

const SALT_ROUNDS = 12;
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 phút

// Kiểm tra mật khẩu có đủ mạng không
export const validatePassword = (password) => {
  if (password.length < 8) return { valid: false, message: "Min 8 characters" };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Need 1 uppercase" };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Need 1 number" };
  if (!/[!@#$%^&*]/.test(password)) return { valid: false, message: "Need 1 special char (!@#$%^&*)" };
  return { valid: true };
};

// Đăng ký user mới
export const registerUser = async ({ email, password }, req) => {
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) throw new Error(passwordCheck.message);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = generateEmailVerificationToken();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerifications: {
        create: {
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
    },
    include: { emailVerifications: true },
  });

  console.log(`Verification link: /auth/verify-email?token=${verificationToken}`);

  return { id: user.id, email: user.email, needsVerification: true };
};

// Đăng nhập
export const loginUser = async ({ email, password }, req) => {
  const ipAddress = req?.ip || req?.connection?.remoteAddress;
  const userAgent = req?.headers?.["user-agent"];

  const user = await prisma.user.findUnique({ where: { email } });

  // Kiểm tra tài khoản có bị khóa không
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const remaining = Math.ceil((user.lockedUntil - new Date()) / 60000);
    throw new Error(`Account locked. Try again in ${remaining} minutes`);
  }

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await handleFailedLogin(user.id, ipAddress);
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) throw new Error("Account deactivated");

  // Reset số lần đăng nhập sai
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLogin: 0, lockedUntil: null },
  });

  await prisma.loginAttempt.create({
    data: { userId: user.id, ipAddress, success: true },
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  // Lưu session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, avatar: user.avatar } };
};

// Làm mới token
export const refreshAccessToken = async (refreshToken) => {
  const storedToken = await verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });

  if (!user || !user.isActive) throw new Error("Invalid user");

  await revokeRefreshToken(refreshToken);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user.id);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// Đăng xuất
export const logoutUser = async (refreshToken) => {
  if (refreshToken) await revokeRefreshToken(refreshToken);
  return { message: "Logged out successfully" };
};

// Đăng xuất khỏi tất cả thiết bị
export const logoutAllDevices = async (userId) => {
  await revokeAllUserTokens(userId);
  await revokeAllUserSessions(userId);
  return { message: "Logged out from all devices" };
};

// Lấy thông tin user hiện tại
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, avatar: true, isEmailVerified: true, createdAt: true },
  });
  if (!user) throw new Error("User not found");
  return user;
};

// Xác thực email
export const verifyEmail = async (token) => {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification) throw new Error("Invalid token");
  if (verification.expiresAt < new Date()) throw new Error("Token expired");
  if (verification.verifiedAt) throw new Error("Email already verified");

  await prisma.user.update({
    where: { id: verification.userId },
    data: { isEmailVerified: true },
  });

  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: { verifiedAt: new Date() },
  });

  return { message: "Email verified successfully" };
};

// Gửi lại email xác thực
export const resendVerification = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { emailVerifications: true },
  });

  if (!user) return { message: "If email exists, verification sent" };
  if (user.isEmailVerified) throw new Error("Email already verified");

  // Xóa token cũ
  await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

  const token = generateEmailVerificationToken();
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  console.log(`New verification link: /auth/verify-email?token=${token}`);
  return { message: "Verification email sent" };
};

// Quên mật khẩu - gửi link reset
export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: "If email exists, reset link sent" };

  // Xóa token reset cũ
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  const token = generatePasswordResetToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 giờ
    },
  });

  console.log(`Password reset link: /auth/reset-password?token=${token}`);
  return { message: "Password reset email sent" };
};

// Reset mật khẩu bằng token
export const resetPassword = async (token, newPassword) => {
  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) throw new Error(passwordCheck.message);

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset) throw new Error("Invalid token");
  if (reset.expiresAt < new Date()) throw new Error("Token expired");
  if (reset.usedAt) throw new Error("Token already used");

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Cập nhật password và vô hiệu hóa tất cả token/session của user
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: reset.userId } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);

  return { message: "Password reset successfully" };
};

// Đổi mật khẩu (khi đã đăng nhập)
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password incorrect");

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) throw new Error(passwordCheck.message);

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);

  return { message: "Password changed successfully" };
};

// Cập nhật avatar
export const updateAvatar = async (userId, filePath) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    // Xóa avatar cũ trên Cloudinary nếu có
    if (currentUser.avatar && currentUser.avatar.includes('cloudinary.com')) {
      try {
        const publicId = `avatars/${currentUser.avatar.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteErr) {
        console.error('Khong the xoa avatar cu:', deleteErr);
      }
    }

    // Upload avatar mới lên Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "avatars",
      width: 400,
      height: 400,
      crop: "fill",
      gravity: "face",
    });

    fs.unlinkSync(filePath);

    return await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.secure_url },
      select: { id: true, email: true, avatar: true },
    });
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw err;
  }
};

// Xử lý khi đăng nhập sai
async function handleFailedLogin(userId, ipAddress) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const newFailedCount = user.failedLogin + 1;

  let lockout = {};
  if (newFailedCount >= LOCKOUT_ATTEMPTS) {
    // Khóa tài khoản 15 phút
    lockout = { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION), failedLogin: 0 };
  } else {
    lockout = { failedLogin: newFailedCount };
  }

  await prisma.user.update({ where: { id: userId }, data: lockout });
  await prisma.loginAttempt.create({ data: { userId, ipAddress, success: false } });
}

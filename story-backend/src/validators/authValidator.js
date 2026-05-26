import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain 1 number")
    .regex(/[!@#$%^&*]/, "Password must contain 1 special character (!@#$%^&*)"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain 1 number")
    .regex(/[!@#$%^&*]/, "Password must contain 1 special character"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain 1 number")
      .regex(/[!@#$%^&*]/, "Password must contain 1 special character"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

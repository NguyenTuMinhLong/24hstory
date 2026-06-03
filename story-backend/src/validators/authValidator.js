import { z } from "zod";

// Validate email
export const registerSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z
    .string()
    .min(8, "Mat khau it nhat 8 ky tu")
    .regex(/[A-Z]/, "Phai co it nhat 1 chu hoa")
    .regex(/[0-9]/, "Phai co it nhat 1 chu so")
    .regex(/[!@#$%^&*]/, "Phai co it nhat 1 ky tu dac biet (!@#$%^&*)"),
});

export const loginSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(1, "Mat khau khong duoc trong"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token khong duoc trong"),
});

// Reset password - cung validation nhu register
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token khong duoc trong"),
  password: z
    .string()
    .min(8, "Mat khau it nhat 8 ky tu")
    .regex(/[A-Z]/, "Phai co it nhat 1 chu hoa")
    .regex(/[0-9]/, "Phai co it nhat 1 chu so")
    .regex(/[!@#$%^&*]/, "Phai co it nhat 1 ky tu dac biet"),
});

// Doi mat khau
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mat khau hien tai khong duoc trong"),
    newPassword: z
      .string()
      .min(8, "Mat khau it nhat 8 ky tu")
      .regex(/[A-Z]/, "Phai co it nhat 1 chu hoa")
      .regex(/[0-9]/, "Phai co it nhat 1 chu so")
      .regex(/[!@#$%^&*]/, "Phai co it nhat 1 ky tu dac biet"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mat khau moi phai khac mat khau cu",
    path: ["newPassword"],
  });

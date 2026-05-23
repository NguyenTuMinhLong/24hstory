import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock modules
jest.unstable_mockModule("@prisma/client", () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

jest.unstable_mockModule("../configs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

// Import after mocking
const { prisma } = await import("../src/prismaClient.js");
const { registerUser, loginUser } = await import("../src/services/authService.js");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should throw error if email already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "1", email: "test@test.com" });

      await expect(registerUser({ email: "test@test.com", password: "password123" }))
        .rejects.toThrow("Email already exists");
    });

    it("should create user with hashed password", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "1",
        email: "new@test.com",
        password: "hashed",
      });

      const user = await registerUser({ email: "new@test.com", password: "password123" });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "new@test.com",
        }),
      });
      expect(user.email).toBe("new@test.com");
    });
  });

  describe("loginUser", () => {
    it("should throw error if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser({ email: "notfound@test.com", password: "password" }))
        .rejects.toThrow("Invalid");
    });

    it("should return token and user on successful login", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@test.com",
        password: hashedPassword,
      });

      process.env.JWT_SECRET = "test-secret";

      const result = await loginUser({ email: "test@test.com", password: "password123" });

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe("test@test.com");
    });

    it("should throw error if password is wrong", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@test.com",
        password: hashedPassword,
      });

      await expect(loginUser({ email: "test@test.com", password: "wrongpassword" }))
        .rejects.toThrow("Invalid");
    });
  });
});

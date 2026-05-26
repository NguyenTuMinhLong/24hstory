import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Mock modules before imports
jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.unstable_mockModule("../src/configs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: "https://cloudinary.com/test.jpg" }),
      destroy: jest.fn(),
    },
  },
}));

// Import after mocking
const { registerUser, loginUser } = await import("../src/services/authService.js");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should throw error if email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "1", email: "test@test.com" });

      await expect(registerUser({ email: "test@test.com", password: "password123" }))
        .rejects.toThrow("Email already exists");
    });

    it("should create user with hashed password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "1",
        email: "new@test.com",
        password: "hashed",
      });

      const user = await registerUser({ email: "new@test.com", password: "password123" });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "new@test.com",
        }),
      });
      expect(user.email).toBe("new@test.com");
    });

    it("should hash password before saving", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: "1", email: data.email, password: data.password })
      );

      const user = await registerUser({ email: "test@test.com", password: "mypassword" });

      // Password should be hashed (not plain text)
      expect(user.password).not.toBe("mypassword");
      expect(user.password).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
    });
  });

  describe("loginUser", () => {
    const hashedPassword = bcrypt.hashSync("correctpassword", 10);

    it("should throw error if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser({ email: "notfound@test.com", password: "password" }))
        .rejects.toThrow("Invalid");
    });

    it("should return token and user on successful login", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@test.com",
        password: hashedPassword,
      });

      const result = await loginUser({ email: "test@test.com", password: "correctpassword" });

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe("test@test.com");
    });

    it("should throw error if password is wrong", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@test.com",
        password: hashedPassword,
      });

      await expect(loginUser({ email: "test@test.com", password: "wrongpassword" }))
        .rejects.toThrow("Invalid");
    });

    it("should generate valid JWT token", async () => {
      const user = { id: "user-123", email: "test@test.com", password: hashedPassword };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await loginUser({ email: "test@test.com", password: "correctpassword" });

      // Verify token can be decoded
      const decoded = jwt.decode(result.token);
      expect(decoded.id).toBe("user-123");
      expect(decoded.email).toBe("test@test.com");
    });
  });
});

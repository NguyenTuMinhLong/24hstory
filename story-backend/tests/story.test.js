import { jest } from "@jest/globals";

// Mock modules
jest.unstable_mockModule("@prisma/client", () => {
  const mockPrismaClient = {
    story: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

jest.unstable_mockModule("../src/configs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: "https://cloudinary.com/story.jpg" }),
      destroy: jest.fn(),
    },
  },
}));

// Import after mocking
const { prisma } = await import("../src/prismaClient.js");
const { createStory, getActiveStories, deleteStory, getMyStories } = await import("../src/services/storyService.js");

describe("Story Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createStory", () => {
    it("should create a story with media URL", async () => {
      const mockStory = {
        id: "story-1",
        userId: "user-1",
        mediaUrl: "https://cloudinary.com/story.jpg",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      prisma.story.create.mockResolvedValue(mockStory);

      const story = await createStory({ userId: "user-1", mediaFilePath: "/tmp/test.jpg" });

      expect(prisma.story.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          mediaUrl: "https://cloudinary.com/story.jpg",
        }),
      });
      expect(story.id).toBe("story-1");
    });
  });

  describe("getActiveStories", () => {
    it("should return grouped stories by user", async () => {
      const mockStories = [
        {
          id: "story-1",
          user: { id: "user-1", email: "user@test.com", avatar: null },
          mediaUrl: "https://cloudinary.com/1.jpg",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
        {
          id: "story-2",
          user: { id: "user-1", email: "user@test.com", avatar: null },
          mediaUrl: "https://cloudinary.com/2.jpg",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
      ];
      prisma.story.findMany.mockResolvedValue(mockStories);

      const result = await getActiveStories();

      expect(result).toHaveLength(1);
      expect(result[0].user.id).toBe("user-1");
      expect(result[0].stories).toHaveLength(2);
    });
  });

  describe("deleteStory", () => {
    it("should throw error if story not found", async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(deleteStory("nonexistent", "user-1"))
        .rejects.toThrow("Story not found");
    });

    it("should throw error if user is not the owner", async () => {
      prisma.story.findUnique.mockResolvedValue({ id: "story-1", userId: "other-user", mediaUrl: "test.jpg" });

      await expect(deleteStory("story-1", "user-1"))
        .rejects.toThrow("Unauthorized");
    });

    it("should delete story if user is owner", async () => {
      prisma.story.findUnique.mockResolvedValue({ id: "story-1", userId: "user-1", mediaUrl: "https://cloudinary.com/story.jpg" });
      prisma.story.delete.mockResolvedValue({ id: "story-1" });

      const result = await deleteStory("story-1", "user-1");

      expect(prisma.story.delete).toHaveBeenCalledWith({ where: { id: "story-1" } });
      expect(result.message).toBe("Story deleted");
    });
  });

  describe("getMyStories", () => {
    it("should return user's stories", async () => {
      const mockStories = [
        { id: "story-1", userId: "user-1", mediaUrl: "test1.jpg" },
        { id: "story-2", userId: "user-1", mediaUrl: "test2.jpg" },
      ];
      prisma.story.findMany.mockResolvedValue(mockStories);

      const stories = await getMyStories("user-1");

      expect(stories).toHaveLength(2);
      expect(prisma.story.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
      });
    });
  });
});

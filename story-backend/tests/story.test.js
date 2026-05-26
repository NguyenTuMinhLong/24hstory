import { jest } from "@jest/globals";

// Mock Prisma
const mockPrisma = {
  story: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

// Mock modules before imports
jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.unstable_mockModule("../src/configs/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: "https://cloudinary.com/story.jpg" }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

// Import after mocking
const { createStory, getActiveStories, deleteStory, getMyStories, getStoryById } = await import(
  "../src/services/storyService.js"
);

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
      mockPrisma.story.create.mockResolvedValue(mockStory);

      const story = await createStory({ userId: "user-1", mediaFilePath: "/tmp/test.jpg" });

      expect(mockPrisma.story.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          mediaUrl: "https://cloudinary.com/story.jpg",
        }),
      });
      expect(story.id).toBe("story-1");
    });

    it("should set expiresAt to 24 hours from now", async () => {
      const before = Date.now();
      mockPrisma.story.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: "story-1", ...data })
      );

      await createStory({ userId: "user-1", mediaFilePath: "/tmp/test.jpg" });

      const createCall = mockPrisma.story.create.mock.calls[0];
      const expiresAt = createCall[0].data.expiresAt;
      const diff = expiresAt.getTime() - before;

      // Should be approximately 24 hours (86400000ms)
      expect(diff).toBeGreaterThan(86390000);
      expect(diff).toBeLessThan(86410000);
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
      mockPrisma.story.findMany.mockResolvedValue(mockStories);

      const result = await getActiveStories();

      expect(result).toHaveLength(1);
      expect(result[0].user.id).toBe("user-1");
      expect(result[0].stories).toHaveLength(2);
    });

    it("should filter out expired stories", async () => {
      mockPrisma.story.findMany.mockResolvedValue([]);

      await getActiveStories();

      const findManyCall = mockPrisma.story.findMany.mock.calls[0];
      expect(findManyCall[0].where.expiresAt.gt).toBeDefined();
    });

    it("should order stories by createdAt desc", async () => {
      mockPrisma.story.findMany.mockResolvedValue([]);

      await getActiveStories();

      const findManyCall = mockPrisma.story.findMany.mock.calls[0];
      expect(findManyCall[0].orderBy).toEqual({ createdAt: "desc" });
    });
  });

  describe("deleteStory", () => {
    it("should throw error if story not found", async () => {
      mockPrisma.story.findUnique.mockResolvedValue(null);

      await expect(deleteStory("nonexistent", "user-1")).rejects.toThrow("Story not found");
    });

    it("should throw error if user is not the owner", async () => {
      mockPrisma.story.findUnique.mockResolvedValue({
        id: "story-1",
        userId: "other-user",
        mediaUrl: "test.jpg",
      });

      await expect(deleteStory("story-1", "user-1")).rejects.toThrow("Unauthorized");
    });

    it("should delete story and cloudinary media if user is owner", async () => {
      mockPrisma.story.findUnique.mockResolvedValue({
        id: "story-1",
        userId: "user-1",
        mediaUrl: "https://res.cloudinary.com/test/image/upload/v1/stories/abc123.jpg",
      });
      mockPrisma.story.delete.mockResolvedValue({ id: "story-1" });

      const result = await deleteStory("story-1", "user-1");

      expect(mockPrisma.story.delete).toHaveBeenCalledWith({ where: { id: "story-1" } });
      expect(result.message).toBe("Story deleted");
    });
  });

  describe("getMyStories", () => {
    it("should return user's stories ordered by createdAt desc", async () => {
      const mockStories = [
        { id: "story-1", userId: "user-1", mediaUrl: "test1.jpg" },
        { id: "story-2", userId: "user-1", mediaUrl: "test2.jpg" },
      ];
      mockPrisma.story.findMany.mockResolvedValue(mockStories);

      const stories = await getMyStories("user-1");

      expect(stories).toHaveLength(2);
      expect(mockPrisma.story.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getStoryById", () => {
    it("should return story with view count", async () => {
      mockPrisma.story.findUnique.mockResolvedValue({
        id: "story-1",
        user: { id: "user-1", email: "user@test.com", avatar: null },
        mediaUrl: "test.jpg",
        _count: { StoryView: 5 },
      });

      const story = await getStoryById("story-1");

      expect(story.id).toBe("story-1");
      expect(story.viewCount).toBe(5);
    });

    it("should throw error if story not found", async () => {
      mockPrisma.story.findUnique.mockResolvedValue(null);

      await expect(getStoryById("nonexistent")).rejects.toThrow("Story not found");
    });
  });
});

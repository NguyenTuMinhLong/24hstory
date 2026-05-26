import { jest } from "@jest/globals";

// Mock Prisma
const mockPrisma = {
  storyView: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
};

// Mock modules before imports
jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Import after mocking
const { markStoryAsSeen, getStoryViewers, getMySeenStories } = await import(
  "../src/services/storyViewService.js"
);

describe("StoryView Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("markStoryAsSeen", () => {
    it("should create a new view record if not exists", async () => {
      const mockView = {
        id: "view-1",
        userId: "user-1",
        storyId: "story-1",
        viewedAt: new Date(),
      };
      mockPrisma.storyView.upsert.mockResolvedValue(mockView);

      const result = await markStoryAsSeen({ userId: "user-1", storyId: "story-1" });

      expect(mockPrisma.storyView.upsert).toHaveBeenCalledWith({
        where: { userId_storyId: { userId: "user-1", storyId: "story-1" } },
        update: { viewedAt: expect.any(Date) },
        create: { userId: "user-1", storyId: "story-1" },
      });
      expect(result.id).toBe("view-1");
    });

    it("should update viewedAt if already seen", async () => {
      const mockView = {
        id: "view-1",
        userId: "user-1",
        storyId: "story-1",
        viewedAt: new Date(),
      };
      mockPrisma.storyView.upsert.mockResolvedValue(mockView);

      await markStoryAsSeen({ userId: "user-1", storyId: "story-1" });

      // Upsert should be called (update scenario)
      expect(mockPrisma.storyView.upsert).toHaveBeenCalled();
    });
  });

  describe("getStoryViewers", () => {
    it("should return all viewers of a story", async () => {
      const mockViewers = [
        { id: "view-1", user: { id: "user-1", email: "user1@test.com" } },
        { id: "view-2", user: { id: "user-2", email: "user2@test.com" } },
      ];
      mockPrisma.storyView.findMany.mockResolvedValue(mockViewers);

      const viewers = await getStoryViewers("story-1");

      expect(viewers).toHaveLength(2);
      expect(mockPrisma.storyView.findMany).toHaveBeenCalledWith({
        where: { storyId: "story-1" },
        include: { user: { select: { id: true, email: true } } },
      });
    });

    it("should return empty array if no viewers", async () => {
      mockPrisma.storyView.findMany.mockResolvedValue([]);

      const viewers = await getStoryViewers("story-1");

      expect(viewers).toHaveLength(0);
    });
  });

  describe("getMySeenStories", () => {
    it("should return all stories seen by user ordered by viewedAt desc", async () => {
      const mockSeenStories = [
        {
          id: "view-1",
          story: {
            id: "story-1",
            user: { id: "user-2", email: "other@test.com", avatar: null },
          },
        },
      ];
      mockPrisma.storyView.findMany.mockResolvedValue(mockSeenStories);

      const stories = await getMySeenStories("user-1");

      expect(stories).toHaveLength(1);
      expect(stories[0].story.id).toBe("story-1");
      expect(mockPrisma.storyView.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: {
          story: {
            include: {
              user: { select: { id: true, email: true, avatar: true } },
            },
          },
        },
        orderBy: { viewedAt: "desc" },
      });
    });
  });
});

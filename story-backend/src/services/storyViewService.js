import { prisma } from "../prismaClient.js";

// Đánh dấu story đã được xem (upsert - tạo mới hoặc cập nhật thời gian)
export const markStoryAsSeen = async ({ userId, storyId }) => {
  return await prisma.storyView.upsert({
    where: {
      userId_storyId: { userId, storyId },
    },
    update: {
      viewedAt: new Date(),
    },
    create: {
      userId,
      storyId,
    },
  });
};

// Lấy danh sách người đã xem một story
export const getStoryViewers = async (storyId) => {
  return await prisma.storyView.findMany({
    where: { storyId },
    include: { user: { select: { id: true, email: true } } },
  });
};

// Lấy danh sách story mà user đã xem
export const getMySeenStories = async (userId) => {
  return await prisma.storyView.findMany({
    where: { userId },
    include: {
      story: {
        include: {
          user: {
            select: { id: true, email: true, avatar: true },
          },
        },
      },
    },
    orderBy: { viewedAt: "desc" },
  });
};

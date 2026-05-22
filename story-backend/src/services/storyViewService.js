import { prisma } from "../prismaClient.js";

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

export const getStoryViewers = async (storyId) => {
  return await prisma.storyView.findMany({
    where: { storyId },
    include: { user: { select: { id: true, email: true } } },
  });
};

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
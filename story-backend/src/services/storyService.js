import cloudinary from "../configs/cloudinary.js";
import fs from "fs";
import { prisma } from "../prismaClient.js";

export const uploadStoryMedia = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "stories",
    });
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  } finally {
    fs.unlinkSync(filePath); // xóa file tạm
  }
};

export const createStory = async ({ userId, mediaFilePath }) => {
  const mediaUrl = await uploadStoryMedia(mediaFilePath);

  const story = await prisma.story.create({
    data: {
      userId,
      mediaUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  return story;
};

export const getActiveStories = async () => {
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const groupedStories = {};

  for (const story of stories) {
    const userId = story.user.id;

    if (!groupedStories[userId]) {
      groupedStories[userId] = {
        user: story.user,
        stories: [],
      };
    }

    groupedStories[userId].stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
    });
  }

  return Object.values(groupedStories);
};

export const deleteStory = async (storyId, userId) => {
  const story = await prisma.story.findUnique({
    where: { id: storyId},
  });
  if (!story) {
    throw new Error("Story not found");
  }
  if (story.userId !== userId) {
    throw new Error("Unauthorized");
  }
  const publicId = story.mediaUrl.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(`stories/${publicId}`);

  await prisma.story.delete({
    where: { id: storyId },
  });

  return { message: "Story deleted" };
};

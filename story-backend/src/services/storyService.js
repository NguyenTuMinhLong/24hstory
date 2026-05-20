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
    where: { expiresAt: { gt: new Date() } },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return stories;
};
import cloudinary from "../configs/cloudinary.js";
import fs from "fs";
import { prisma } from "../prismaClient.js";

// Upload file lên Cloudinary, trả về URL
export const uploadStoryMedia = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "stories",
    });
    return result.secure_url;
  } catch (err) {
    console.error("Loi upload Cloudinary:", err);
    throw err;
  } finally {
    fs.unlinkSync(filePath); // Xóa file tạm
  }
};

// Tạo story mới - tự động hết hạn sau 24h
export const createStory = async ({ userId, mediaFilePath }) => {
  const mediaUrl = await uploadStoryMedia(mediaFilePath);

  const story = await prisma.story.create({
    data: {
      userId,
      mediaUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return story;
};

// Lấy tất cả story đang hoạt động (chưa hết hạn)
// Nhóm theo user
export const getActiveStories = async () => {
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: new Date() },
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
    orderBy: { createdAt: "desc" },
  });

  // Nhóm stories theo user
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

// Xóa story - chỉ chủ sở hữu mới được xóa
export const deleteStory = async (storyId, userId) => {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });
  
  if (!story) throw new Error("Story not found");
  if (story.userId !== userId) throw new Error("Unauthorized");

  // Xóa ảnh trên Cloudinary
  const publicId = story.mediaUrl.split("/").pop().split(".")[0];
  await cloudinary.uploader.destroy(`stories/${publicId}`);

  await prisma.story.delete({ where: { id: storyId } });

  return { message: "Story deleted" };
};

// Lấy story của chính mình
export const getMyStories = async (userId) => {
  return await prisma.story.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

// Lấy story theo ID
export const getStoryById = async (storyId) => {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          avatar: true,
        },
      },
      _count: {
        select: { StoryView: true },
      },
    },
  });
  
  if (!story) throw new Error("Story not found");
  
  return {
    ...story,
    viewCount: story._count.StoryView,
  };
};

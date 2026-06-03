import { createStory, getActiveStories, getMyStories, getStoryById, deleteStory } from "../services/storyService.js";

export const createStoryController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const story = await createStory({
      userId: req.user.id,
      mediaFilePath: req.file.path,
    });

    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getActiveStoriesController = async (req, res) => {
  try {
    const stories = await getActiveStories();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStoryController = async (req, res) => {
  try {
    const result = await deleteStory(req.params.storyId, req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === "Story not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Unauthorized") {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getMyStoriesController = async (req, res) => {
  try {
    const stories = await getMyStories(req.user.id);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStoryByIdController = async (req, res) => {
  try {
    const story = await getStoryById(req.params.storyId);
    res.json(story);
  } catch (err) {
    if (err.message === "Story not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

import { createStory, getActiveStories } from "../services/storyService.js";

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
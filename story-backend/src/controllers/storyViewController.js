import { markStoryAsSeen, getStoryViewers, getMySeenStories } from "../services/storyViewService.js";

export const markSeenController = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const result = await markStoryAsSeen({ userId, storyId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getViewersController = async (req, res) => {
  try {
    const { storyId } = req.params;
    const viewers = await getStoryViewers(storyId);
    res.json(viewers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMySeenStoriesController = async (req, res) => {
  try {
    const stories = await getMySeenStories(req.user.id);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
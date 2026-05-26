import { create } from 'zustand'
import api from '../lib/api'

const useStoryStore = create((set, get) => ({
  stories: [],
  myStories: [],
  activeUsers: [],
  isLoading: false,
  error: null,

  setStories: (stories) => set({ stories }),

  fetchActiveStories: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/stories')
      set({ stories: response.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
    }
  },

  fetchMyStories: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/stories/me')
      set({ myStories: response.data, isLoading: false })
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
    }
  },

  createStory: async (file) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('media', file)

      const response = await api.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      set({ myStories: [response.data, ...get().myStories], isLoading: false })
      return { success: true }
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  deleteStory: async (storyId) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/stories/${storyId}`)
      set({
        myStories: get().myStories.filter((s) => s.id !== storyId),
        isLoading: false,
      })
      return { success: true }
    } catch (error) {
      set({ error: error.response?.data?.message, isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  markAsSeen: async (storyId) => {
    try {
      await api.post(`/story-view/seen/${storyId}`)
    } catch (error) {
      console.error('Failed to mark story as seen:', error)
    }
  },

  getStoryViewers: async (storyId) => {
    try {
      const response = await api.get(`/story-view/viewers/${storyId}`)
      return response.data
    } catch (error) {
      return []
    }
  },
}))

export default useStoryStore

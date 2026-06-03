import { create } from 'zustand'
import api from '../lib/api'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Đăng nhập
  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = response.data

      // Lưu token
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  },

  // Đăng ký
  register: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await api.post('/auth/register', { email, password })
      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message || 'Registration failed' }
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await api.post('/auth/logout', { refreshToken })
    } catch (error) {
      // Vẫn tiếp tục đăng xuất dù API lỗi
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  // Đăng xuất khỏi tất cả thiết bị
  logoutAll: async () => {
    set({ isLoading: true })
    try {
      await api.post('/auth/logout-all')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, isAuthenticated: false, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Lấy thông tin user hiện tại
  fetchUser: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ isAuthenticated: false })
      return
    }

    try {
      const response = await api.get('/auth/me')
      set({ user: response.data, isAuthenticated: true })
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, isAuthenticated: false })
    }
  },

  // Đổi mật khẩu
  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true })
    try {
      await api.patch('/auth/password', { currentPassword, newPassword })
      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },

  // Cập nhật avatar
  updateAvatar: async (file) => {
    set({ isLoading: true })
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.patch('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      set({ user: { ...get().user, avatar: response.data.avatar }, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.response?.data?.message }
    }
  },
}))

export default useAuthStore

import { useEffect, useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { StoryBar } from '@/components/stories'
import useAuthStore from '@/stores/authStore'
import useStoryStore from '@/stores/storyStore'
import { Loader2 } from 'lucide-react'

const Home = () => {
  const { user, fetchUser } = useAuthStore()
  const { stories, fetchActiveStories, isLoading } = useStoryStore()
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Load data khi mount
  useEffect(() => {
    const loadData = async () => {
      await fetchUser()
      await fetchActiveStories()
      setIsInitialLoading(false)
    }
    loadData()
  }, [fetchUser, fetchActiveStories])

  const handleAddStory = () => {
    // Chuyen den trang tao story
    window.location.href = '/stories'
  }

  if (isInitialLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Story bar - hien thi danh sach story */}
        <StoryBar currentUser={user} onAddStory={handleAddStory} />

        <div className="mt-8">
          <h2 className="text-lg font-medium text-text mb-4">Hoat Dong Gan Day</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-secondary" size={24} />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary mb-2">Chua co story nao</p>
              <p className="text-sm text-muted">Theo doi nguoi khac hoac tao story dau tien!</p>
            </div>
          ) : (
            <p className="text-sm text-secondary">
              {stories.length} nguoi co story dang hoat dong
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Home

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

  useEffect(() => {
    const loadData = async () => {
      await fetchUser()
      await fetchActiveStories()
      setIsInitialLoading(false)
    }
    loadData()
  }, [fetchUser, fetchActiveStories])

  const handleAddStory = () => {
    // Navigate to create story page
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
        <StoryBar currentUser={user} onAddStory={handleAddStory} />

        <div className="mt-8">
          <h2 className="text-lg font-medium text-text mb-4">Recent Activity</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-secondary" size={24} />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary mb-2">No stories yet</p>
              <p className="text-sm text-muted">Follow people or create your first story!</p>
            </div>
          ) : (
            <p className="text-sm text-secondary">
              {stories.length} user{stories.length !== 1 ? 's' : ''} with active stories
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Home

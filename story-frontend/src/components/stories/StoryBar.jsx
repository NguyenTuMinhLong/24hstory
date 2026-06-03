import { useState } from 'react'
import { StoryRing } from './StoryRing'
import { StoryViewer } from './StoryViewer'
import useStoryStore from '@/stores/storyStore'

const StoryBar = ({ currentUser, onAddStory }) => {
  const { stories, markAsSeen } = useStoryStore()
  const [selectedUserIndex, setSelectedUserIndex] = useState(null)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)

  // Mở viewer để xem story
  const handleStoryClick = (userIndex, storyIndex = 0) => {
    setSelectedUserIndex(userIndex)
    setSelectedStoryIndex(storyIndex)
  }

  // Đóng viewer
  const handleCloseViewer = () => {
    setSelectedUserIndex(null)
    setSelectedStoryIndex(0)
  }

  // Đánh dấu đã xem
  const handleMarkSeen = async (storyId) => {
    await markAsSeen(storyId)
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Nút tạo story mới */}
        {currentUser && (
          <div onClick={onAddStory} className="cursor-pointer flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5 group">
              <div className="relative">
                <div className="p-[2px] rounded-full bg-surface border-2 border-border">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-secondary border-2 border-dashed border-border-hover">
                    +
                  </div>
                </div>
              </div>
              <span className="text-xs text-secondary group-hover:text-text transition-colors">
                Add
              </span>
            </div>
          </div>
        )}

        {/* Danh sách story */}
        {stories.map((userStories, index) => (
          <div key={userStories.user.id} className="flex-shrink-0">
            <StoryRing
              user={userStories.user}
              stories={userStories.stories}
              onClick={() => handleStoryClick(index)}
            />
          </div>
        ))}

        {stories.length === 0 && !currentUser && (
          <p className="text-sm text-secondary">Chua co story nao</p>
        )}
      </div>

      {/* Story Viewer */}
      {selectedUserIndex !== null && stories[selectedUserIndex] && (
        <StoryViewer
          users={stories}
          initialUserIndex={selectedUserIndex}
          initialStoryIndex={selectedStoryIndex}
          onClose={handleCloseViewer}
          onMarkSeen={handleMarkSeen}
        />
      )}
    </>
  )
}

export { StoryBar }

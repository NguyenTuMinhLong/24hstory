import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Eye, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Progress } from '@/components/ui/Progress'

// Format thời gian tương đối
const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (hours >= 24) return `${Math.floor(hours / 24)}d ago`
  if (hours >= 1) return `${hours}h ago`
  if (minutes >= 1) return `${minutes}m ago`
  return 'Just now'
}

// Story viewer - xem story với progress bar, navigation
const StoryViewer = ({ users, initialUserIndex = 0, initialStoryIndex = 0, onClose, onMarkSeen }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef(null)

  const currentUser = users[currentUserIndex]
  const currentStory = currentUser?.stories[currentStoryIndex]
  const totalStories = currentUser?.stories?.length || 0

  const STORY_DURATION = 5000 // 5 giây mỗi story
  const progressInterval = 50

  // Chuyển sang story tiếp theo
  const goToNextStory = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)

    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex((prev) => prev + 1)
      setProgress(0)
    } else if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex((prev) => prev + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      onClose()
      return
    }

    setTimeout(() => setIsTransitioning(false), 300)
  }, [currentStoryIndex, totalStories, currentUserIndex, users.length, isTransitioning, onClose])

  // Quay lại story trước
  const goToPrevStory = useCallback(() => {
    if (isTransitioning) return
    setIsTransitioning(true)

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1)
      setProgress(0)
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex((prev) => prev - 1)
      setCurrentStoryIndex(users[currentUserIndex - 1]?.stories?.length - 1 || 0)
      setProgress(0)
    }

    setTimeout(() => setIsTransitioning(false), 300)
  }, [currentStoryIndex, currentUserIndex, users, isTransitioning])

  // Đánh dấu đã xem khi story thay đổi
  useEffect(() => {
    if (onMarkSeen && currentStory?.id) {
      onMarkSeen(currentStory.id)
    }
  }, [currentStory?.id, onMarkSeen])

  // Timer tự động chuyển story
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextStory()
          return 0
        }
        return prev + (progressInterval / STORY_DURATION) * 100
      })
    }, progressInterval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, goToNextStory])

  // Xử lý swipe trên mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    e.target.startX = touch.clientX
  }

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0]
    const diff = e.target.startX - touch.clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNextStory()
      else goToPrevStory()
    }
  }

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-md h-full max-h-[90vh] bg-surface rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <Progress
            value={(currentStoryIndex + 1) / totalStories * 100}
            className="mb-2"
          />
        </div>

        {/* Header - user info + close button */}
        <div
          className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <Avatar src={currentUser?.user?.avatar} alt={currentUser?.user?.email} size="sm" />
            <div>
              <p className="text-sm font-medium text-text">
                {currentUser?.user?.email?.split('@')[0]}
              </p>
              <div className="flex items-center gap-1 text-xs text-secondary">
                <Clock size={10} />
                <span>{formatTimeAgo(currentStory?.createdAt)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation arrows */}
        <div
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center cursor-pointer text-white/50 hover:text-white z-10',
            isTransitioning && 'pointer-events-none'
          )}
          onClick={(e) => { e.stopPropagation(); goToPrevStory(); }}
        >
          <ChevronLeft size={32} />
        </div>

        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center cursor-pointer text-white/50 hover:text-white z-10',
            isTransitioning && 'pointer-events-none'
          )}
          onClick={(e) => { e.stopPropagation(); goToNextStory(); }}
        >
          <ChevronRight size={32} />
        </div>

        {/* Footer - view count */}
        <div
          className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 text-xs text-secondary">
            <Eye size={14} />
            <span>{currentStory.viewCount || 0} views</span>
          </div>
        </div>

        {/* Story image - click to pause */}
        <div
          className={cn(
            'w-full h-full flex items-center justify-center',
            isTransitioning && 'animate-fade-in'
          )}
          onClick={() => setIsPaused(!isPaused)}
        >
          <img
            src={currentStory.mediaUrl}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <p className="text-white text-sm">Tạm dừng</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { StoryViewer }

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

// Stack effect - hiển thị nhiều story như chồng đống
const StoryStack = ({ stories, currentIndex, onNext, onPrev }) => {
  const visibleStories = stories?.slice(currentIndex, currentIndex + 3) || []
  const stackRef = useRef(null)

  // Hiệu ứng perspective khi mount
  useEffect(() => {
    if (stackRef.current) {
      stackRef.current.style.transform = 'perspective(1000px) rotateY(-5deg)'
    }
  }, [])

  return (
    <div
      ref={stackRef}
      className="relative w-full h-full transition-transform duration-500"
      style={{ perspective: '1000px' }}
    >
      {visibleStories.map((story, index) => {
        const isTop = index === 0
        const offset = index * 8
        const scale = 1 - index * 0.05
        const opacity = 1 - index * 0.15
        const rotate = index * 2

        return (
          <div
            key={story.id}
            className={cn(
              'absolute inset-0 rounded-xl overflow-hidden transition-all duration-500',
              !isTop && 'pointer-events-none'
            )}
            style={{
              transform: `
                translateY(${offset}px)
                scale(${scale})
                rotateZ(${rotate}deg)
              `,
              opacity: opacity,
              zIndex: visibleStories.length - index,
            }}
          >
            <img
              src={story.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
              onClick={onNext}
            />

            {/* Gradient overlay cho story trên cùng */}
            {isTop && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export { StoryStack }

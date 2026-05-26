import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

const StoryRing = ({ user, stories, isOwn = false, onClick }) => {
  const hasUnseen = stories?.some((s) => !s.seen)
  const isSeen = stories?.length > 0 && !hasUnseen

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group"
    >
      <div className="relative">
        <div
          className={cn(
            'p-[2px] rounded-full',
            isOwn
              ? 'bg-surface border-2 border-border'
              : hasUnseen
              ? 'bg-gradient-to-tr from-primary via-primary-hover to-secondary'
              : isSeen
              ? 'bg-border'
              : 'bg-gradient-to-tr from-primary via-primary-hover to-secondary'
          )}
        >
          <Avatar src={user?.avatar} alt={user?.email} size="default" />
        </div>

        {isOwn && (
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary text-background rounded-full flex items-center justify-center text-xs font-bold">
            +
          </div>
        )}
      </div>

      <span className="text-xs text-secondary truncate max-w-[60px] group-hover:text-text transition-colors">
        {isOwn ? 'Your story' : user?.email?.split('@')[0] || 'User'}
      </span>
    </button>
  )
}

export { StoryRing }

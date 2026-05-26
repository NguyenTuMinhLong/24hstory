import { cn } from '@/lib/utils'

const Avatar = ({ src, alt, className, size = 'default' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-xl',
  }

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        'bg-surface border border-border',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt || 'Avatar'}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface text-secondary">
          {alt ? alt.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  )
}

export { Avatar }

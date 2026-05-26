import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded border border-border bg-surface px-3 py-2',
        'text-sm text-text placeholder:text-muted',
        'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-200',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-card border-border text-text hover:border-primary',
    primary: 'bg-primary text-background hover:bg-primary-hover',
    ghost: 'text-secondary hover:text-text hover:bg-surface',
    outline: 'bg-transparent border border-border text-text hover:border-primary',
  }

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10',
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded border transition-colors',
        'font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button }

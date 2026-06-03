import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Kết hợp className linh hoạt (như clsx nhưng hỗ trợ tailwind)
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

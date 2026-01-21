'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Loading state component for async operations.
 * Provides consistent loading UI across the app.
 */

interface LoadingStateProps {
  /** Message to display while loading */
  message?: string
  /** Additional CSS classes */
  className?: string
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({
  message = 'Đang tải...',
  className,
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        'flex min-h-[200px] items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className={cn('mr-2 animate-spin', sizeClasses[size])} aria-hidden="true" />
      <span>{message}</span>
      <span className="sr-only">Đang tải...</span>
    </div>
  )
}

/**
 * Inline loading spinner for smaller spaces (buttons, inline content).
 */
export function LoadingSpinner({ size = 'sm', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], className)}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải...</span>
    </Loader2>
  )
}

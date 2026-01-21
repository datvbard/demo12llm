'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Error state component for displaying errors with retry option.
 * Provides consistent error UI across the app.
 */

interface ErrorStateProps {
  /** Error message to display */
  message: string
  /** Optional detailed error description */
  description?: string
  /** Retry handler - if provided, shows retry button */
  onRetry?: () => void
  /** Retry button text */
  retryText?: string
  /** Additional CSS classes */
  className?: string
}

export function ErrorState({
  message,
  description,
  onRetry,
  retryText = 'Thử lại',
  className
}: ErrorStateProps) {
  return (
    <div
      className={cn('flex min-h-[200px] items-center justify-center p-8', className)}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" aria-hidden="true" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {message}
        </h3>
        {description && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={retryText}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {retryText}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error message for form fields and smaller spaces.
 */
interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <p
      className={cn('text-sm text-red-600 dark:text-red-400', className)}
      role="alert"
      id={`form-error-${Math.random().toString(36).substring(7)}`}
    >
      <span className="sr-only">Lỗi: </span>
      {message}
    </p>
  )
}

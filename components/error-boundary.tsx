'use client'

import { Component, ReactNode } from 'react'

/**
 * Error Boundary component for catching runtime errors in React components.
 * Wrap page components or sections to gracefully handle errors.
 */

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('[ErrorBoundary]', error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <div className="text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Đã xảy ra lỗi
              </h2>
              <p className="mb-4 text-gray-600">
                Chúng tôi xin lỗi vì sự bất tiện này. Vui lòng tải lại trang.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary for functional components.
 * Usage: wrap a component that might throw errors.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

/**
 * Standardized API error handler.
 * Provides consistent error responses across all API routes.
 */

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

interface ApiErrorResponse {
  error: string
  code?: ApiErrorCode
  details?: unknown
}

/**
 * Handle API errors with proper type safety and status codes.
 *
 * @param error - The caught error (unknown type)
 * @param context - Context string for logging (e.g., "POST /api/entries")
 * @param fallbackMessage - User-friendly message when error details can't be exposed
 */
export function handleApiError(
  error: unknown,
  context: string,
  fallbackMessage: string = 'An error occurred'
): NextResponse<ApiErrorResponse> {
  console.error(`[${context}]`, error)

  // Handle Error instances
  if (error instanceof Error) {
    // Authentication/Authorization errors
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    // Development: expose error message
    const isDev = process.env.NODE_ENV === 'development'
    if (isDev) {
      return NextResponse.json(
        { error: error.message, code: 'INTERNAL_ERROR', details: error.stack },
        { status: 500 }
      )
    }
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        return NextResponse.json(
          { error: 'Resource not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      case 'P2002':
        return NextResponse.json(
          { error: 'Resource already exists', code: 'CONFLICT' },
          { status: 409 }
        )
      case 'P2003':
        return NextResponse.json(
          { error: 'Referenced resource does not exist', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      default:
        break
    }
  }

  // Fallback: generic error (no sensitive info leaked)
  return NextResponse.json(
    { error: fallbackMessage, code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

/**
 * Create a validation error response (400).
 */
export function validationError(message: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: 'VALIDATION_ERROR' },
    { status: 400 }
  )
}

/**
 * Create a not found error response (404).
 */
export function notFoundError(resource: string = 'Resource'): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: `${resource} not found`, code: 'NOT_FOUND' },
    { status: 404 }
  )
}

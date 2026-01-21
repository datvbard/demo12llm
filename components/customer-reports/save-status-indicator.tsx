'use client'

import React from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  error?: string
}

export function SaveStatusIndicator({ status, error }: SaveStatusIndicatorProps) {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Đang lưu...</span>
          </div>
        )
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Đã lưu</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400" title={error}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Lỗi</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-center h-6">
      {getStatusContent()}
    </div>
  )
}

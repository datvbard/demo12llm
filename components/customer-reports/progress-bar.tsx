'use client'

import React from 'react'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProgressBar({ current, total, label, showPercentage = true, size = 'md' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className="w-full" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={label || `Tiến độ: ${current} trên ${total}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-medium" aria-live="polite">
              {current}/{total} ({percentage}%)
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`} aria-hidden="true">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

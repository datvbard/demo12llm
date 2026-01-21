'use client'

import React from 'react'
import type { ReportResponseField } from '@/types/customer-report'

interface ResponseFieldInputProps {
  field: ReportResponseField
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export function ResponseFieldInput({ field, value, onChange, disabled }: ResponseFieldInputProps) {
  const baseInputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"

  const renderField = () => {
    switch (field.type) {
      case 'DROPDOWN':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">-- Chọn --</option>
            {field.options?.map((opt) => (
              <option key={typeof opt === 'string' ? opt : String(opt.value)} value={typeof opt === 'string' ? opt : String(opt.value)}>
                {typeof opt === 'string' ? opt : opt.label}
              </option>
            ))}
          </select>
        )

      case 'TEXT':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
            placeholder={field.label}
          />
        )

      case 'NUMBER':
        return (
          <input
            type="number"
            step="any"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
            placeholder="0"
          />
        )

      case 'DATE':
        return (
          <input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          />
        )

      case 'CHECKBOX':
        return (
          <div className="flex items-center h-10">
            <input
              type="checkbox"
              checked={value ?? false}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  )
}

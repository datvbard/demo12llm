'use client'

import React from 'react'
import type { ReportResponseField, FieldValue } from '@/types/customer-report'

interface ResponseFieldInputProps {
  field: ReportResponseField
  value: FieldValue | null
  onChange: (value: FieldValue | null) => void
  disabled?: boolean
}

export function ResponseFieldInput({ field, value, onChange, disabled }: ResponseFieldInputProps) {
  const fieldId = `field-${field.id}`
  const baseInputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"

  const renderField = () => {
    switch (field.type) {
      case 'DROPDOWN':
        return (
          <select
            id={fieldId}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
            aria-label={field.label}
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
            id={fieldId}
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
            placeholder={field.label}
            aria-label={field.label}
          />
        )

      case 'NUMBER':
        return (
          <input
            id={fieldId}
            type="number"
            step="any"
            value={String(value ?? '')}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value)
              if (val !== null && isNaN(val)) return // Prevent NaN
              onChange(val)
            }}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
            placeholder="0"
            aria-label={field.label}
          />
        )

      case 'DATE':
        return (
          <input
            id={fieldId}
            type="date"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
            aria-label={field.label}
          />
        )

      case 'CHECKBOX':
        return (
          <div className="flex items-center h-10">
            <input
              id={fieldId}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
              aria-label={field.label}
            />
          </div>
        )

      default:
        return (
          <input
            id={fieldId}
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled}
            className={baseInputClasses}
            aria-label={field.label}
          />
        )
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  )
}

'use client'

import React from 'react'
import { ResponseFieldInput } from './response-field-input'
import { SaveStatusIndicator, SaveStatus } from './save-status-indicator'
import type { ReportResponseField, CustomerRow, FieldValue } from '@/types/customer-report'

interface CustomerRowCardProps {
  row: CustomerRow
  fields: ReportResponseField[]
  values: Record<string, FieldValue | null>
  onChange: (fieldKey: string, value: FieldValue | null) => void
  saveStatus: SaveStatus
  saveError?: string
  disabled?: boolean
  rowNumber: number
}

export function CustomerRowCard({
  row,
  fields,
  values,
  onChange,
  saveStatus,
  saveError,
  disabled,
  rowNumber,
}: CustomerRowCardProps) {
  // Extract customer info for display
  const customerInfo = row.customerData
  const displayKeys = Object.keys(customerInfo).slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              #{rowNumber} • {displayKeys.map(key => String(customerInfo[key] || '')).filter(Boolean).join(' • ')}
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
              {displayKeys.map((key) => (
                <span key={key}>
                  <span className="font-medium">{key}:</span> {String(customerInfo[key] || '-')}
                </span>
              ))}
            </div>
          </div>
          <SaveStatusIndicator status={saveStatus} error={saveError} />
        </div>
      </div>

      {/* Card body - response fields */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <ResponseFieldInput
              key={field.id}
              field={field}
              value={values[field.key]}
              onChange={(value) => onChange(field.key, value)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* Additional customer data (if any) */}
        {Object.keys(customerInfo).length > 3 && (
          <details className="mt-4">
            <summary className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              Xem thêm thông tin khách hàng
            </summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(customerInfo).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">{key}:</span>
                    <span className="text-gray-600 dark:text-gray-400">{String(value || '-')}</span>
                  </div>
                ))}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

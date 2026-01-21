'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'
import { CustomerRowCard } from '@/components/customer-reports/customer-row-card'
import { ProgressBar } from '@/components/customer-reports/progress-bar'
import { SaveStatus } from '@/components/customer-reports/save-status-indicator'
import type { ReportResponseField, CustomerRow, FieldValue } from '@/types/customer-report'
import { getErrorMessage } from '@/lib/api-error-handler'

export default function FillCustomerReportPage() {
  const params = useParams()
  const router = useRouter()
  const timeoutRef = useRef<Record<string, NodeJS.Timeout>>({})

  const [report, setReport] = useState<any>(null)
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [fields, setFields] = useState<ReportResponseField[]>([])
  const [values, setValues] = useState<Record<string, Record<string, FieldValue | null>>>( {})
  const [saveStatuses, setSaveStatuses] = useState<Record<string, SaveStatus>>({})
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'all' | 'incomplete'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/customer-reports/${params.id}`)
        if (!res.ok) {
          const err = await res.json()
          setError(err.error || 'Failed to load report')
          setLoading(false)
          return
        }

        const data = await res.json()
        setReport(data)

        // Sort fields by order
        const sortedFields = (data.template.fields || []).sort((a: any, b: any) => a.order - b.order)
        setFields(sortedFields)

        // Set rows and initial values
        setRows(data.rows || [])

        // Build values map from responses
        const initialValues: Record<string, Record<string, FieldValue | null>> = {}
        data.rows?.forEach((row: CustomerRow) => {
          initialValues[row.id] = {}
          row.responses?.forEach((response) => {
            initialValues[row.id][response.fieldKey] = response.value as FieldValue | null
          })
        })
        setValues(initialValues)

        setLoading(false)
      } catch (err) {
        console.error('[loadData]', getErrorMessage(err))
        setError('Network error. Please try again.')
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const saveRow = useCallback(
    async (rowId: string) => {
      const rowValues = values[rowId]
      if (!rowValues || !report) return

      setSaveStatuses((prev) => ({ ...prev, [rowId]: 'saving' }))
      setSaveErrors((prev) => ({ ...prev, [rowId]: '' }))

      try {
        const res = await fetch(`/api/customer-reports/${params.id}/rows/${rowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses: rowValues }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to save')
        }

        setSaveStatuses((prev) => ({ ...prev, [rowId]: 'saved' }))

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatuses((prev) => ({ ...prev, [rowId]: 'idle' }))
        }, 2000)
      } catch (err) {
        console.error('[saveRow]', getErrorMessage(err))
        const errMsg = getErrorMessage(err)
        setSaveStatuses((prev) => ({ ...prev, [rowId]: 'error' }))
        setSaveErrors((prev) => ({ ...prev, [rowId]: errMsg }))
      }
    },
    [values, report, params.id]
  )

  const handleChange = useCallback(
    (rowId: string, fieldKey: string, value: FieldValue | null) => {
      setValues((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], [fieldKey]: value },
      }))

      // Debounced save
      if (timeoutRef.current[rowId]) {
        clearTimeout(timeoutRef.current[rowId])
      }
      timeoutRef.current[rowId] = setTimeout(() => {
        saveRow(rowId)
      }, 500)
    },
    [saveRow]
  )

  // Filter and search rows (memoized for performance)
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Search filter
      if (searchQuery) {
        const searchData = Object.values(row.customerData).join(' ').toLowerCase()
        if (!searchData.includes(searchQuery.toLowerCase())) {
          return false
        }
      }

      // Completion filter
      if (filter === 'incomplete') {
        const requiredFields = fields.filter((f) => f.required)
        const isComplete = requiredFields.every((field) => {
          const value = values[row.id]?.[field.key]
          return value !== null && value !== '' && value !== undefined
        })
        return !isComplete
      }

      return true
    })
  }, [rows, searchQuery, filter, fields, values])

  // Calculate progress (memoized for performance)
  const totalRows = rows.length
  const completedRows = useMemo(() => {
    return rows.filter((row) => {
      const requiredFields = fields.filter((f) => f.required)
      return requiredFields.every((field) => {
        const value = values[row.id]?.[field.key]
        return value !== null && value !== '' && value !== undefined
      })
    }).length
  }, [rows, fields, values])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-gray-600 dark:text-gray-300">Đang tải...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            ← Quay lại
          </button>
          <div className="mt-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const isLocked = report.status === 'LOCKED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Báo Cáo Online - Phòng KHCN
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/customer-reports"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Quay lại
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Report info header */}
        <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {report.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mẫu: {report.template?.name} • {totalRows} khách hàng
              </p>
            </div>
            {isLocked && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                Đã khóa
              </div>
            )}
          </div>

          {/* Progress bar */}
          <ProgressBar current={completedRows} total={totalRows} label="Tiến độ:" />
        </div>

        {/* Filters */}
        {!isLocked && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'incomplete')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="incomplete">Chỉ chưa điền</option>
            </select>
          </div>
        )}

        {/* Customer rows */}
        <div className="space-y-4">
          {filteredRows.length > 0 ? (
            filteredRows.map((row, index) => (
              <CustomerRowCard
                key={row.id}
                row={row}
                fields={fields}
                values={values[row.id] || {}}
                onChange={(fieldKey, value) => handleChange(row.id, fieldKey, value)}
                saveStatus={saveStatuses[row.id] || 'idle'}
                saveError={saveErrors[row.id]}
                disabled={isLocked}
                rowNumber={index + 1}
              />
            ))
          ) : (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || filter === 'incomplete' ? 'Không tìm thấy khách hàng nào' : 'Chưa có khách hàng nào'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

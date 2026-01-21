'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReportResponseField {
  id: string
  label: string
  key: string
  type: 'DROPDOWN' | 'TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX'
  options: string[] | null
  required: boolean
  order: number
}

interface CustomerRow {
  id: string
  rowIndex: number
  branchId: string | null
  branch: { id: string; name: string } | null
  customerData: Record<string, unknown>
  responses: Array<{
    fieldKey: string
    value: unknown
    updatedBy: string
    updatedAt: string
  }>
  updatedAt: string
}

interface CustomerReport {
  id: string
  name: string
  status: 'OPEN' | 'LOCKED'
  template: {
    id: string
    name: string
    fields: ReportResponseField[]
  }
  columns: Array<{ key: string; label: string; type?: string }>
  _count: { rows: number }
  completedRows: number
}

export default function CustomerReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<CustomerReport | null>(null)
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [filterBranch, setFilterBranch] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/customer-reports/${params.id}`)
      if (!res.ok) throw new Error('Report not found')
      const data = await res.json()
      setReport(data)
      setRows(data.rows || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/branches')
      const data = await res.json()
      setBranches(data.branches || [])
    } catch (err) {
      console.error('Failed to load branches')
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchReport(), fetchBranches()])
  }, [fetchReport, fetchBranches])

  const handleToggleStatus = async () => {
    if (!report) return

    const newStatus = report.status === 'OPEN' ? 'LOCKED' : 'OPEN'
    const action = newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'

    if (!confirm(`Bạn có chắc muốn ${action} báo cáo này?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/customer-reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        await fetchReport()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${action} report`)
      }
    } catch (err) {
      alert(`Failed to ${action} report`)
    }
  }

  const handleExportExcel = () => {
    window.open(`/api/admin/customer-reports/${params.id}/export/excel`, '_blank')
  }

  const handleExportPDF = () => {
    window.open(`/api/admin/customer-reports/${params.id}/export/pdf`, '_blank')
  }

  const getResponseValue = (row: CustomerRow, fieldKey: string) => {
    const response = row.responses.find((r) => r.fieldKey === fieldKey)
    return response?.value
  }

  const formatResponseValue = (value: unknown, fieldType: string, options: string[] | null) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">—</span>
    }

    if (fieldType === 'CHECKBOX') {
      return value === true || value === 'true' ? (
        <span className="text-green-600">✓</span>
      ) : (
        <span className="text-gray-400">—</span>
      )
    }

    if (fieldType === 'DROPDOWN' && options) {
      return String(value)
    }

    if (fieldType === 'DATE') {
      try {
        return new Date(String(value)).toLocaleDateString('vi-VN')
      } catch {
        return String(value)
      }
    }

    return String(value)
  }

  const hasResponse = (row: CustomerRow) => {
    return row.responses && row.responses.length > 0
  }

  // Filter rows
  const filteredRows = rows.filter((row) => {
    // Branch filter
    if (filterBranch !== 'all' && row.branchId !== filterBranch) {
      return false
    }

    // Status filter
    if (filterStatus === 'completed' && !hasResponse(row)) {
      return false
    }
    if (filterStatus === 'pending' && hasResponse(row)) {
      return false
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const customerDataStr = JSON.stringify(row.customerData).toLowerCase()
      const branchName = row.branch?.name.toLowerCase() || ''
      return (
        customerDataStr.includes(searchLower) || branchName.includes(searchLower)
      )
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / pageSize)
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  const getCompletionPercentage = () => {
    if (!report || report._count.rows === 0) return 0
    return Math.round((report.completedRows / report._count.rows) * 100)
  }

  if (loading) {
    return <div className="p-8">Đang tải...</div>
  }

  if (!report) {
    return <div className="p-8">Không tìm thấy báo cáo</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            href="/admin/customer-reports"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {report._count.rows} khách hàng • {report.completedRows}/{report._count.rows} đã điền ({getCompletionPercentage()}%)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                className={`rounded-md px-4 py-2 text-sm text-white font-medium ${
                  report.status === 'OPEN'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {report.status === 'OPEN' ? 'Khóa' : 'Mở'}
              </button>
              <button
                onClick={handleExportExcel}
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white font-medium hover:bg-green-700"
              >
                Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white font-medium hover:bg-red-700"
              >
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-lg bg-white p-4 shadow">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Chi nhánh
              </label>
              <select
                value={filterBranch}
                onChange={(e) => {
                  setFilterBranch(e.target.value)
                  setPage(1)
                }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="all">Tất cả chi nhánh</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setPage(1)
                }}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="completed">Đã điền</option>
                <option value="pending">Chưa điền</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm theo tên KH, CIF, chi nhánh..."
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Hiển thị {filteredRows.length} / {rows.length} hàng
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg bg-white shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    STT
                  </th>
                  {report.columns.slice(0, 3).map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chi nhánh
                  </th>
                  {report.template.fields.slice(0, 3).map((field) => (
                    <th
                      key={field.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.rowIndex + 1}
                    </td>
                    {report.columns.slice(0, 3).map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                        {String(row.customerData[col.key] || '')}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row.branch?.name || <span className="text-gray-400">—</span>}
                    </td>
                    {report.template.fields.slice(0, 3).map((field) => (
                      <td key={field.id} className="px-4 py-3 text-sm text-gray-900">
                        {formatResponseValue(
                          getResponseValue(row, field.key),
                          field.type,
                          field.options
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm">
                      {hasResponse(row) ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Đã điền
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Chưa
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRows.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt; Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

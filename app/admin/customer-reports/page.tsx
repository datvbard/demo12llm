'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CustomerReport {
  id: string
  name: string
  status: 'OPEN' | 'LOCKED'
  template: { id: string; name: string }
  _count: { rows: number }
  completedRows: number
  createdAt: string
}

interface ReportTemplate {
  id: string
  name: string
}

export default function CustomerReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<CustomerReport[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [error, setError] = useState('')

  // Upload form state
  const [reportName, setReportName] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [branchColumn, setBranchColumn] = useState('chi_nhanh')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    Promise.all([fetchReports(), fetchTemplates()])
  }, [])

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/customer-reports')
      const data = await res.json()
      setReports(data.reports || [])
    } catch (err) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/report-templates')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('Failed to load templates')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa báo cáo "${name}"?`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/customer-reports/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete report')
      }
    } catch (err) {
      alert('Failed to delete report')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleStatus = async (report: CustomerReport) => {
    const newStatus = report.status === 'OPEN' ? 'LOCKED' : 'OPEN'
    const action = newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'

    if (!confirm(`Bạn có chắc muốn ${action} báo cáo "${report.name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/customer-reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        await fetchReports()
      } else {
        const data = await res.json()
        alert(data.error || `Failed to ${action} report`)
      }
    } catch (err) {
      alert(`Failed to ${action} report`)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Vui lòng chọn file Excel')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', reportName)
      formData.append('templateId', templateId)
      formData.append('branchColumn', branchColumn)

      const res = await fetch('/api/admin/customer-reports', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload report')
      }

      const newReport = await res.json()
      setReports((prev) => [newReport, ...prev])
      setShowUploadModal(false)
      setReportName('')
      setTemplateId('')
      setBranchColumn('chi_nhanh')
      setFile(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (
        droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        droppedFile.type === 'application/vnd.ms-excel'
      ) {
        setFile(droppedFile)
      } else {
        setError('Chỉ chấp nhận file Excel (.xlsx, .xls)')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getCompletionPercentage = (report: CustomerReport) => {
    if (report._count.rows === 0) return 0
    return Math.round((report.completedRows / report._count.rows) * 100)
  }

  if (loading) {
    return <div className="p-8">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Quay lại Admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Báo cáo khách hàng
            </h1>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
          >
            + Upload Excel
          </button>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      report.status === 'OPEN'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.status === 'OPEN' ? 'OPEN' : 'LOCKED'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {report._count.rows} khách hàng • {getCompletionPercentage(report)}% đã điền
                  {' '}• Mẫu: {report.template.name}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/customer-reports/${report.id}`)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Xem
                </button>
                <button
                  onClick={() => router.push(`/admin/customer-reports/${report.id}/export/excel`)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleToggleStatus(report)}
                  className={`rounded-md px-3 py-1 text-sm text-white ${
                    report.status === 'OPEN'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {report.status === 'OPEN' ? 'Khóa' : 'Mở'}
                </button>
                <button
                  onClick={() => handleDelete(report.id, report.name)}
                  disabled={deleting === report.id}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting === report.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center text-gray-500 py-12 rounded-lg bg-white">
            <p className="text-lg mb-2">Chưa có báo cáo nào</p>
            <p className="text-sm">Nhấn &quot;Upload Excel&quot; để tạo báo cáo mới</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload báo cáo mới
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên báo cáo *
                  </label>
                  <input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="VD: Nợ xấu T1/2026"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mẫu báo cáo *
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Chọn mẫu...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Column chi nhánh *
                  </label>
                  <input
                    value={branchColumn}
                    onChange={(e) => setBranchColumn(e.target.value)}
                    placeholder="VD: chi_nhanh"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tên column trong Excel chứa thông tin chi nhánh
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File Excel *
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0])
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-center"
                    >
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click để upload
                        </span>{' '}
                        hoặc kéo thả file vào đây
                      </div>
                      <p className="text-xs text-gray-500">.xlsx, .xls (tối đa 5MB)</p>
                    </label>
                    {file && (
                      <div className="mt-2 text-sm text-gray-700">
                        Đã chọn: {file.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Đang upload...' : 'Upload & Tạo báo cáo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

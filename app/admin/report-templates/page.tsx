'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getErrorMessage } from '@/lib/api-error-handler'

interface ReportTemplate {
  id: string
  name: string
  description: string | null
  _count: { fields: number; reports: number }
  createdAt: string
}

export default function ReportTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/report-templates')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('[fetchTemplates]', getErrorMessage(err))
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/admin/report-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create template')
      }

      const newTemplate = await res.json()
      setTemplates((prev) => [newTemplate, ...prev])
      setName('')
      setDescription('')
      setShowCreateForm(false)
    } catch (err) {
      console.error('[handleCreate]', getErrorMessage(err))
      setError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, templateName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mẫu "${templateName}"?`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/report-templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete template')
      }
    } catch (err) {
      console.error('[handleDelete]', getErrorMessage(err))
      alert('Failed to delete template')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return <div className="p-8">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Quay lại Admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Quản lý mẫu báo cáo
            </h1>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
          >
            + Tạo mẫu mới
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Tạo mẫu báo cáo mới
            </h2>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-red-800">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên mẫu *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Báo cáo nợ xấu"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Báo cáo xử lý nợ xấu hàng tháng"
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo mẫu'}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Link
                href={`/admin/report-templates/${t.id}`}
                className="flex-1 hover:bg-gray-50 transition -m-4 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">{t.name}</span>
                    {t.description && (
                      <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t._count.fields} trường response • Tạo {formatDate(t.createdAt)}
                  </div>
                </div>
              </Link>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => router.push(`/admin/report-templates/${t.id}`)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  disabled={deleting === t.id}
                  className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting === t.id ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center text-gray-500 py-12 rounded-lg bg-white">
            <p className="text-lg mb-2">Chưa có mẫu báo cáo nào</p>
            <p className="text-sm">Nhấn &quot;Tạo mẫu mới&quot; để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  )
}

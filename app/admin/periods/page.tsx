'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getErrorMessage } from '@/lib/api-error-handler'

interface Period {
  id: string
  name: string
  status: string
  template: { name: string }
  _count: { entries: number }
}

interface Template {
  id: string
  name: string
}

export default function AdminPeriodsPage() {
  const router = useRouter()
  const [periods, setPeriods] = useState<Period[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/periods').then((r) => r.json()),
      fetch('/api/templates').then((r) => r.json()),
    ]).then(([periodsData, templatesData]) => {
      setPeriods(periodsData)
      setTemplates(templatesData)
      setLoading(false)
    })
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/periods', {
      method: 'POST',
      body: formData,
    })
    if (res.ok) {
      const newPeriod = await res.json()
      setPeriods((prev) => [newPeriod, ...prev])
      e.currentTarget?.reset()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete period "${name}"?`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/periods?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPeriods((prev) => prev.filter((p) => p.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete period')
      }
    } catch (err) {
      console.error('[handleDelete]', getErrorMessage(err))
      alert('Failed to delete period')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Periods</h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Admin
          </Link>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-lg bg-white p-4 shadow"
        >
          <div className="flex gap-4">
            <select
              name="templateId"
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">Select Template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Period name"
              required
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
            >
              Create Period
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Entries
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {periods.map((period) => (
                <tr key={period.id}>
                  <td className="px-4 py-3 text-sm font-medium">{period.name}</td>
                  <td className="px-4 py-3 text-sm">{period.template?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        period.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {period.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{period._count?.entries ?? 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/periods/${period.id}/branches`}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Progress
                    </Link>
                    <Link
                      href={`/admin/periods/${period.id}/summary`}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Summary
                    </Link>
                    <button
                      onClick={() => handleDelete(period.id, period.name)}
                      disabled={deleting === period.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deleting === period.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {periods.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No periods yet. Create your first period above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

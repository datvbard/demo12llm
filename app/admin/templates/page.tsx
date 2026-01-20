'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  _count: { fields: number }
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((data) => {
        setTemplates(data)
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete template')
      }
    } catch (err) {
      alert('Failed to delete template')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Admin
          </Link>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const res = await fetch('/api/templates', {
              method: 'POST',
              body: formData,
            })
            if (res.ok) {
              const newTemplate = await res.json()
              setTemplates((prev) => [newTemplate, ...prev])
              e.currentTarget.reset()
            }
          }}
          className="mb-6 rounded-lg bg-white p-4 shadow"
        >
          <div className="flex gap-4">
            <input
              name="name"
              placeholder="Template name"
              required
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow"
            >
              <Link
                href={`/admin/templates/${t.id}`}
                className="flex-1 hover:bg-gray-50 transition -m-4 p-4"
              >
                <span className="font-semibold text-gray-900">{t.name}</span>
                <span className="text-sm text-gray-500 ml-4">{t._count.fields} fields</span>
              </Link>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                disabled={deleting === t.id}
                className="ml-4 rounded-md bg-red-600 px-4 py-2 text-sm text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleting === t.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No templates yet. Create your first template above.
          </div>
        )}
      </div>
    </div>
  )
}

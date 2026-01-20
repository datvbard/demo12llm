'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Field {
  id: string
  label: string
  key: string
  order: number
  formula?: string | null
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [fields, setFields] = useState<Field[]>([])
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [formula, setFormula] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/templates/${params.id}/fields`)
      .then(r => r.json())
      .then(setFields)
  }, [params.id])

  async function addField(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/templates/${params.id}/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, key, formula }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add field')
      }

      setLabel('')
      setKey('')
      setFormula('')

      const updated = await fetch(`/api/templates/${params.id}/fields`)
      setFields(await updated.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteField(fieldId: string) {
    if (!confirm('Delete this field?')) return

    await fetch(`/api/templates/${params.id}/fields?fieldId=${fieldId}`, {
      method: 'DELETE',
    })
    setFields(f => f.filter(x => x.id !== fieldId))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Template Fields</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{error}</div>
        )}

        <form onSubmit={addField} className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 font-semibold text-gray-900">Add New Field</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Label</label>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g., Revenue"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Key</label>
              <input
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="e.g., revenue"
                pattern="[a-z_][a-z0-9_]*"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Lowercase letters, numbers, underscores</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Formula (optional)</label>
              <input
                value={formula}
                onChange={e => setFormula(e.target.value)}
                placeholder="e.g., field_a + field_b"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Use field keys, +, -, *, /, ( )</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Field'}
            </button>
          </div>
        </form>

        <div className="rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Label</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Key</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Formula</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map((f, i) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{f.label}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.key}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.formula || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => deleteField(f.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {fields.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No fields yet. Add your first field above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

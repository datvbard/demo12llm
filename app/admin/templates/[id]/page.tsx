'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/api-error-handler'

interface Field {
  id: string
  label: string
  key: string | null
  order: number
  formula?: string | null
  parentId?: string | null
  parent?: { id: string; label: string } | null
  children?: Field[]
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [fields, setFields] = useState<Field[]>([])
  const [label, setLabel] = useState('')
  const [key, setKey] = useState('')
  const [formula, setFormula] = useState('')
  const [isParent, setIsParent] = useState(false)
  const [parentId, setParentId] = useState('')
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
        body: JSON.stringify({
          label,
          key: isParent ? null : key,
          formula: isParent ? null : formula,
          parentId: parentId || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add field')
      }

      setLabel('')
      setKey('')
      setFormula('')
      setIsParent(false)
      setParentId('')

      const updated = await fetch(`/api/templates/${params.id}/fields`)
      setFields(await updated.json())
    } catch (err) {
      console.error('[addField]', getErrorMessage(err))
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function deleteField(fieldId: string) {
    await fetch(`/api/templates/${params.id}/fields?fieldId=${fieldId}`, {
      method: 'DELETE',
    })
    setFields(f => f.filter(x => x.id !== fieldId))
  }

  // Separate parent and child fields for display
  const parentFields = fields.filter(f => !f.parentId)
  const getChildFields = (parentId: string) => fields.filter(f => f.parentId === parentId)

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

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isParent"
                  checked={isParent}
                  onChange={e => {
                    setIsParent(e.target.checked)
                    if (e.target.checked) {
                      setKey('')
                      setFormula('')
                      setParentId('')
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isParent" className="ml-2 block text-sm text-gray-700">
                  Parent field (section header - no key/formula)
                </label>
              </div>
            </div>

            {!isParent && (
              <>
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
                  <label className="block text-sm font-medium text-gray-700">Parent (optional)</label>
                  <select
                    value={parentId}
                    onChange={e => setParentId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">No parent (top-level field)</option>
                    {fields.filter(f => f.key === null).map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Select a parent to create sub-field</p>
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
              </>
            )}

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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parentFields.map((f, i) => {
                const children = getChildFields(f.id)
                const isParent = f.key === null

                return (
                  <React.Fragment key={f.id}>
                    <tr className={isParent ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 text-sm">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {isParent && <span className="font-bold text-blue-900">📁 </span>}
                        {f.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{f.key || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{f.formula || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          isParent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isParent ? 'Parent' : 'Field'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => deleteField(f.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {children.map(child => (
                      <tr key={child.id} className="bg-gray-50">
                        <td className="px-4 py-3 text-sm pl-8">└</td>
                        <td className="px-4 py-3 text-sm font-medium">{child.label}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{child.key}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{child.formula || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            Child
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => deleteField(child.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}
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

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/api-error-handler'

interface Field {
  id: string
  label: string
  key: string
  order: number
  formula?: string | null
}

interface Value {
  templateFieldId: string
  value: number
}

interface Entry {
  id: string
  status: string
  values?: Value[]
}

export default function BranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [fields, setFields] = useState<Field[]>([])
  const [values, setValues] = useState<Record<string, number>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { id, branchId } = params
    Promise.all([
      fetch(`/api/admin/periods/${id}/entry/${branchId}`).then((r) =>
        r.json()
      ),
      fetch(`/api/admin/periods/${id}/fields`).then((r) => r.json()),
    ])
      .then(([entryData, fieldsData]) => {
        setEntry(entryData)
        setFields(fieldsData)
        const valueMap: Record<string, number> = {}
        entryData.values?.forEach((v: Value) => {
          valueMap[v.templateFieldId] = v.value
        })
        setValues(valueMap)
        setLoading(false)
      })
  }, [params])

  async function handleConfirm() {
    if (!entry) return
    const { id } = params
    await fetch(`/api/admin/entries/${entry.id}/confirm`, {
      method: 'POST',
    })
    router.push(`/admin/periods/${id}/branches`)
  }

  async function handleUnlock() {
    if (!entry) return
    if (!confirm('Bạn có chắc muốn mở khóa báo cáo này? Chi nhánh sẽ có thể chỉnh sửa lại dữ liệu.')) {
      return
    }
    const res = await fetch(`/api/admin/entries/${entry.id}/unlock`, {
      method: 'POST',
    })
    if (res.ok) {
      const { id } = params
      router.push(`/admin/periods/${id}/branches`)
    } else {
      const data = await res.json()
      alert(data.error || 'Không thể mở khóa')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!entry) {
    return <div className="p-8">Entry not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>

        <div className="mt-4 rounded-md bg-gray-100 p-4">
          Status: <span className="font-semibold">{entry.status}</span>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Field
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map((field) => (
                <tr key={field.id}>
                  <td className="px-4 py-3 text-sm">{field.order + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{field.label}</td>
                  <td className="px-4 py-3 text-sm">
                    {values[field.id] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {entry.status === 'SUBMITTED' && (
          <div className="mt-6">
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-md bg-green-600 px-6 py-2 text-white font-medium hover:bg-green-700"
            >
              Confirm & Lock
            </button>
          </div>
        )}

        {entry.status === 'LOCKED' && (
          <div className="mt-6">
            <button
              onClick={handleUnlock}
              className="rounded-md bg-orange-600 px-6 py-2 text-white font-medium hover:bg-orange-700"
            >
              Mở khóa
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Mở khóa để chi nhánh có thể chỉnh sửa và nộp lại báo cáo.
            </p>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Entry</h2>
              <p className="mt-4 text-gray-600">
                This will lock the entry permanently. The branch will not be able
                to make changes.
              </p>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-md bg-gray-300 px-4 py-2 font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

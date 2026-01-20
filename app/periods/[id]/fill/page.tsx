'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { evaluateFormula } from '@/lib/formula-parser'
import { signOut } from 'next-auth/react'

interface Field {
  id: string
  label: string
  key: string
  order: number
  formula?: string | null
}

interface EntryValue {
  templateFieldId: string
  value: number
}

export default function FillPeriodPage() {
  const params = useParams()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const [fields, setFields] = useState<Field[]>([])
  const [entry, setEntry] = useState<any>(null)
  const [values, setValues] = useState<Record<string, number>>({})
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'LOCKED'>('DRAFT')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [periodRes, entryRes] = await Promise.all([
          fetch(`/api/periods/${params.id}`),
          fetch(`/api/entries?periodId=${params.id}`),
        ])

        if (!periodRes.ok) {
          const err = await periodRes.json()
          setError(err.error || 'Failed to load period')
          setLoading(false)
          return
        }

        const periodData = await periodRes.json()

        if (!entryRes.ok) {
          const err = await entryRes.json()
          setError(err.error || 'Failed to load entry')
          setLoading(false)
          return
        }

        const entryData = await entryRes.json()

        setFields(periodData.template.fields || [])
        if (entryData) {
          setEntry(entryData)
          setStatus(entryData.status)
          const valueMap: Record<string, number> = {}
          entryData.values?.forEach((v: EntryValue) => {
            valueMap[v.templateFieldId] = v.value
          })
          setValues(valueMap)
        }
        setLoading(false)
      } catch (err) {
        setError('Network error. Please try again.')
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const saveValue = useCallback(
    async (fieldId: string, value: number) => {
      if (!entry?.id) return

      setSaving(true)
      try {
        await fetch(`/api/entries/${entry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateFieldId: fieldId, value }),
        })
      } catch (err) {
        setError('Failed to save')
      } finally {
        setSaving(false)
      }
    },
    [entry?.id]
  )

  const handleChange = (fieldId: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value)
    setValues((prev) => ({ ...prev, [fieldId]: num }))

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => saveValue(fieldId, num), 500)
  }

  const calculateField = (field: Field): number => {
    if (field.formula) {
      try {
        const keyToValue: Record<string, number> = {}
        fields.forEach((f) => {
          keyToValue[f.key] = values[f.id] ?? 0
        })
        return evaluateFormula(field.formula, keyToValue)
      } catch {
        return 0
      }
    }
    return values[field.id] ?? 0
  }

  async function handleStartEntry() {
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId: params.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setEntry(data)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to start entry')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  async function handleSubmit() {
    const res = await fetch(`/api/entries/${entry.id}/submit`, {
      method: 'POST',
    })
    if (res.ok) {
      setStatus('SUBMITTED')
      router.push('/periods')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to submit')
    }
  }

  async function handleWithdraw() {
    const res = await fetch(`/api/entries/${entry.id}/withdraw`, {
      method: 'POST',
    })
    if (res.ok) {
      setStatus('DRAFT')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div className="mt-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Start Data Entry</h1>
            <p className="mt-4 text-gray-600">Click the button below to begin.</p>
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4 text-red-800">{error}</div>
            )}
            <button
              onClick={handleStartEntry}
              className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
            >
              Start Entry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{error}</div>
        )}

        <div className="mb-4 rounded-md bg-gray-100 p-4 flex items-center justify-between">
          <span className="font-semibold">Status: {status}</span>
          {saving && <span className="text-gray-500 text-sm">Saving...</span>}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
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
              {fields.map((field) => {
                const isFormula = !!field.formula
                const displayValue = calculateField(field)

                return (
                  <tr key={field.id}>
                    <td className="px-4 py-3 text-sm">{field.order + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{field.label}</td>
                    <td className="px-4 py-3 text-sm">
                      {isFormula ? (
                        <span className="text-gray-500">{displayValue}</span>
                      ) : (
                        <input
                          type="number"
                          step="any"
                          value={values[field.id] ?? ''}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          disabled={status !== 'DRAFT'}
                          className="w-32 rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-x-2">
          {status === 'DRAFT' && (
            <button
              onClick={handleSubmit}
              className="rounded-md bg-green-600 px-6 py-2 text-white font-medium hover:bg-green-700"
            >
              Submit
            </button>
          )}
          {status === 'SUBMITTED' && (
            <button
              onClick={handleWithdraw}
              className="rounded-md bg-yellow-600 px-6 py-2 text-white font-medium hover:bg-yellow-700"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getErrorMessage } from '@/lib/api-error-handler'

interface ReportResponseField {
  id: string
  label: string
  key: string
  type: 'DROPDOWN' | 'TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX'
  options: string[] | null
  required: boolean
  order: number
}

interface ReportTemplate {
  id: string
  name: string
  description: string | null
  fields: ReportResponseField[]
}

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'DATE', label: 'Date' },
  { value: 'CHECKBOX', label: 'Checkbox' },
] as const

export default function ReportTemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<ReportTemplate | null>(null)
  const [fields, setFields] = useState<ReportResponseField[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [error, setError] = useState('')
  const [editingField, setEditingField] = useState<ReportResponseField | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldKey, setFieldKey] = useState('')
  const [fieldType, setFieldType] = useState<'DROPDOWN' | 'TEXT' | 'NUMBER' | 'DATE' | 'CHECKBOX'>('TEXT')
  const [fieldOptions, setFieldOptions] = useState('')
  const [fieldRequired, setFieldRequired] = useState(false)

  const fetchTemplate = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/report-templates/${params.id}`)
      if (!res.ok) throw new Error('Template not found')
      const data = await res.json()
      setTemplate(data)
      setName(data.name)
      setDescription(data.description || '')
      setFields(data.fields || [])
    } catch (err) {
      console.error('[fetchTemplate]', getErrorMessage(err))
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchTemplate()
  }, [fetchTemplate])

  const handleSaveTemplate = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/report-templates/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update template')
      }

      await fetchTemplate()
    } catch (err) {
      console.error('[Error]', getErrorMessage(err))
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const openFieldModal = (field?: ReportResponseField) => {
    if (field) {
      setEditingField(field)
      setFieldLabel(field.label)
      setFieldKey(field.key)
      setFieldType(field.type)
      setFieldOptions(field.options?.join(', ') || '')
      setFieldRequired(field.required)
    } else {
      setEditingField(null)
      setFieldLabel('')
      setFieldKey('')
      setFieldType('TEXT')
      setFieldOptions('')
      setFieldRequired(false)
    }
    setShowFieldModal(true)
  }

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault()

    const options = fieldType === 'DROPDOWN' ? fieldOptions.split(',').map(o => o.trim()).filter(Boolean) : null

    if (fieldType === 'DROPDOWN' && (!options || options.length === 0)) {
      setError('Dropdown field must have at least one option')
      return
    }

    try {
      const url = editingField
        ? `/api/admin/report-templates/${params.id}/fields/${editingField.id}`
        : `/api/admin/report-templates/${params.id}/fields`

      const res = await fetch(url, {
        method: editingField ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: fieldLabel,
          key: fieldKey,
          type: fieldType,
          options,
          required: fieldRequired,
          order: editingField ? editingField.order : fields.length,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save field')
      }

      setShowFieldModal(false)
      await fetchTemplate()
    } catch (err) {
      console.error('[Error]', getErrorMessage(err))
      setError(getErrorMessage(err))
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Bạn có chắc muốn xóa trường này?')) return

    try {
      const res = await fetch(`/api/admin/report-templates/${params.id}/fields/${fieldId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete field')
      await fetchTemplate()
    } catch (err) {
      console.error('[Error]', getErrorMessage(err))
      setError(getErrorMessage(err))
    }
  }

  const handleReorderFields = async (dragIndex: number, dropIndex: number) => {
    const newFields = [...fields]
    const [removed] = newFields.splice(dragIndex, 1)
    newFields.splice(dropIndex, 0, removed)

    const reorderedFields = newFields.map((f, i) => ({ ...f, order: i }))
    setFields(reorderedFields)

    try {
      const res = await fetch(`/api/admin/report-templates/${params.id}/fields/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldIds: reorderedFields.map(f => f.id) }),
      })

      if (!res.ok) throw new Error('Failed to reorder fields')
    } catch (err) {
      console.error('[Error]', getErrorMessage(err))
      setError(getErrorMessage(err))
      await fetchTemplate()
    }
  }

  if (loading) {
    return <div className="p-8">Đang tải...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/admin/report-templates"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{error}</div>
        )}

        {/* Template Info */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tên mẫu</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Các trường response
            </h2>
            <button
              onClick={() => openFieldModal()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700"
            >
              + Thêm trường
            </button>
          </div>

          <div className="divide-y">
            {fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('dragIndex', String(index))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'))
                  handleReorderFields(dragIndex, index)
                }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-move"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 cursor-grab">☰</span>
                  <span className="text-sm text-gray-500">{index + 1}.</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-sm text-gray-500 ml-2">({field.key})</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Loại: {FIELD_TYPES.find(t => t.value === field.type)?.label}
                      {field.options && (
                        <span className="ml-2">Options: {field.options.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openFieldModal(field)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Chưa có trường nào. Nhấn &quot;Thêm trường&quot; để bắt đầu.
            </div>
          )}
        </div>
      </div>

      {/* Field Editor Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingField ? 'Sửa trường' : 'Thêm trường mới'}
              </h3>

              <form onSubmit={handleSaveField} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Label *
                  </label>
                  <input
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    placeholder="VD: Biện pháp xử lý"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Key *
                  </label>
                  <input
                    value={fieldKey}
                    onChange={(e) => setFieldKey(e.target.value)}
                    placeholder="VD: action_type"
                    pattern="[a-z][a-z0-9_]*"
                    required
                    disabled={!!editingField}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Chỉ chữ thường, số, gạch dưới. Không thể đổi sau khi tạo.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Loại *
                  </label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {fieldType === 'DROPDOWN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Options *
                    </label>
                    <input
                      value={fieldOptions}
                      onChange={(e) => setFieldOptions(e.target.value)}
                      placeholder="VD: Đang thu hồi, Pháp lý, Cơ cấu nợ"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Ngăn cách bằng dấu phẩy
                    </p>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="required"
                    checked={fieldRequired}
                    onChange={(e) => setFieldRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                    Bắt buộc
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFieldModal(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
                  >
                    {editingField ? 'Cập nhật' : 'Thêm'}
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

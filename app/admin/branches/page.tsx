'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getErrorMessage } from '@/lib/api-error-handler'

interface Branch {
  id: string
  name: string
  _count: { users: number }
}

export default function BranchesPage() {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [branchName, setBranchName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/admin/branches')
      if (res.ok) {
        const data = await res.json()
        setBranches(data.data || data || [])
      }
    } catch (err) {
      console.error('[fetchBranches]', getErrorMessage(err))
      setError('Không thể tải danh sách chi nhánh')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchName.trim()) {
      setError('Vui lòng nhập tên chi nhánh')
      return
    }

    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: branchName.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Không thể tạo chi nhánh')
      }

      const newBranch = await res.json()
      setBranches((prev) => [...prev, newBranch])
      setBranchName('')
      setShowCreateForm(false)
    } catch (err) {
      console.error('[handleCreate]', getErrorMessage(err))
      setError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa chi nhánh "${name}"?`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBranches((prev) => prev.filter((b) => b.id !== id))
      } else {
        const data = await res.json()
        alert(data.error || 'Không thể xóa chi nhánh')
      }
    } catch (err) {
      console.error('[handleDelete]', getErrorMessage(err))
      alert('Không thể xóa chi nhánh')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quản Lý Chi Nhánh
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {branches.length} chi nhánh
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Quay lại
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-b-2xl shadow-lg p-6">
          {/* Create Form */}
          <div className="mb-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tạo Chi Nhánh Mới
              </button>
            ) : (
              <form onSubmit={handleCreate} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Tên chi nhánh (VD: CN Hà Nội)"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Đang tạo...' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setBranchName('')
                      setError('')
                    }}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </form>
            )}
          </div>

          {/* Branches List */}
          {branches.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p>Chưa có chi nhánh nào</p>
              <p className="text-sm mt-1">Tạo chi nhánh đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{branch.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {branch._count.users} người dùng
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(branch.id, branch.name)}
                    disabled={deleting === branch.id}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                  >
                    {deleting === branch.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

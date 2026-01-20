'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Branch {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  username: string
  role: string
  branch: Branch | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    branchId: '',
  })

  useEffect(() => {
    fetchUsers()
    fetchBranches()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchBranches() {
    try {
      const res = await fetch('/api/admin/branches')
      if (res.ok) {
        const data = await res.json()
        setBranches(data)
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create user')
      return
    }

    setSuccess('User created successfully')
    setFormData({ email: '', username: '', password: '', branchId: '' })
    setShowCreateForm(false)
    fetchUsers()
  }

  async function onResetPassword(userId: string, username: string) {
    const newPassword = prompt(`Enter new password for ${username}:`)
    if (!newPassword) return

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to reset password')
      return
    }

    setSuccess(`Password reset for ${username}`)
  }

  async function onDeleteUser(userId: string, username: string) {
    if (!confirm(`Are you sure you want to delete user ${username}?`)) {
      return
    }

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to delete user')
      return
    }

    setSuccess(`User ${username} deleted successfully`)
    fetchUsers()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              &larr; Back to Dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Manage Users</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Create User'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{success}</div>
        )}

        {showCreateForm && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New User</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
              >
                Create User
              </button>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Branch</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.branch?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">{user.role}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => onResetPassword(user.id, user.username)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id, user.username)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

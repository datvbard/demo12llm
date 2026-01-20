import { requireAdmin } from '@/lib/server-auth'
import { ChangePasswordForm } from '@/components/change-password-form'
import Link from 'next/link'

export default async function AdminProfilePage() {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div className="rounded-lg bg-white p-6 shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            {user.username && <p><span className="font-medium">Username:</span> {user.username}</p>}
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}

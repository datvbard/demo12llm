import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChangePasswordForm } from '@/components/change-password-form'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function BranchProfilePage() {
  const session = await getServerSession(authOptions)
  const user = session!.user!

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Branch Data Collection</h1>
            <div className="flex items-center gap-4">
              <Link href="/periods" className="text-sm text-blue-600 hover:text-blue-800">
                Back to Periods
              </Link>
              <span className="text-sm text-gray-600">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Profile</h2>

        <div className="rounded-lg bg-white p-6 shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            {user.username && <p><span className="font-medium">Username:</span> {user.username}</p>}
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}

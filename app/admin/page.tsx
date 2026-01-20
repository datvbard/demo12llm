import { requireAdmin } from '@/lib/server-auth'
import Link from 'next/link'

export default async function AdminPage() {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/templates"
            className="rounded-lg bg-white p-6 shadow hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
            <p className="mt-2 text-gray-600">Manage data collection templates</p>
          </Link>

          <Link
            href="/admin/periods"
            className="rounded-lg bg-white p-6 shadow hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-semibold text-gray-900">Periods</h2>
            <p className="mt-2 text-gray-600">Manage collection periods</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

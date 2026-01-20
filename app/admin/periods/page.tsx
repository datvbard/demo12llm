import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPeriodsPage() {
  await requireAdmin()

  const periods = await prisma.period.findMany({
    include: {
      template: { select: { name: true } },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const templates = await prisma.template.findMany()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Periods</h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Admin
          </Link>
        </div>

        <form
          action="/api/admin/periods"
          method="POST"
          className="mb-6 rounded-lg bg-white p-4 shadow"
        >
          <div className="flex gap-4">
            <select
              name="templateId"
              required
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">Select Template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Period name"
              required
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
            >
              Create Period
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Entries
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {periods.map((period) => (
                <tr key={period.id}>
                  <td className="px-4 py-3 text-sm font-medium">{period.name}</td>
                  <td className="px-4 py-3 text-sm">{period.template.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        period.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {period.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{period._count.entries}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/periods/${period.id}/branches`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Progress
                    </Link>
                    <Link
                      href={`/admin/periods/${period.id}/summary`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Summary
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {periods.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No periods yet. Create your first period above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

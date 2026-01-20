import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function BranchProgressPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const period = await prisma.period.findUnique({
    where: { id },
    include: { template: true },
  })

  const branches = await prisma.branch.findMany({
    include: {
      entries: {
        where: { periodId: id },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link href="/admin/periods" className="text-blue-600 hover:text-blue-800">
            ← Back
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{period?.name}</h1>
          <p className="text-gray-600">Template: {period?.template.name}</p>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {branches.map((branch) => {
                const entry = branch.entries[0]
                const status = entry?.status ?? 'NOT_STARTED'

                return (
                  <tr key={branch.id}>
                    <td className="px-4 py-3 text-sm font-medium">{branch.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          status === 'LOCKED'
                            ? 'bg-purple-100 text-purple-800'
                            : status === 'SUBMITTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : status === 'DRAFT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry?.updatedAt
                        ? new Date(entry.updatedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entry ? (
                        <Link
                          href={`/admin/periods/${id}/branch/${branch.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View & Approve
                        </Link>
                      ) : (
                        <span className="text-gray-400">Not started</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {branches.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No branches found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function PeriodsPage() {
  const session = await getServerSession(authOptions)
  const user = session!.user!

  const periods = await prisma.period.findMany({
    include: {
      template: { select: { name: true } },
      entries: {
        where: { branchId: user.branchId },
        select: { id: true, status: true, submittedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Branch Data Collection</h1>
            <div className="flex items-center gap-4">
              <Link href="/periods/profile" className="text-sm text-blue-600 hover:text-blue-800">
                Profile
              </Link>
              <span className="text-sm text-gray-600">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Periods</h2>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {periods.map((period) => {
                const entry = period.entries[0]
                const status = entry?.status ?? 'NOT_STARTED'
                const isEditable = period.status === 'OPEN' && status !== 'LOCKED'

                return (
                  <tr key={period.id}>
                    <td className="px-4 py-3 text-sm font-medium">{period.name}</td>
                    <td className="px-4 py-3 text-sm">{period.template.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          status === 'LOCKED'
                            ? 'bg-gray-100 text-gray-800'
                            : status === 'SUBMITTED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : status === 'DRAFT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditable ? (
                        <Link
                          href={`/periods/${period.id}/fill`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {status === 'DRAFT' || !entry ? 'Fill Data' : 'View/Edit'}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Locked</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {periods.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No periods available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

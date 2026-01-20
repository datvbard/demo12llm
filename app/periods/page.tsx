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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; classes: string }> = {
      'LOCKED': { text: 'Đã khóa', classes: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      'SUBMITTED': { text: 'Đã gửi', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' },
      'DRAFT': { text: 'Nháp', classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
      'NOT_STARTED': { text: 'Chưa bắt đầu', classes: 'bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' },
    }
    return badges[status] || badges['NOT_STARTED']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Hệ Thống Quản Lý Dữ Liệu Theo Chi Nhánh
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.fullName || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/periods/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Hồ sơ
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kỳ Báo Cáo
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chọn kỳ báo cáo để nhập hoặc xem dữ liệu
          </p>
        </div>

        {/* Periods table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Kỳ báo cáo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Mẫu dữ liệu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {periods.map((period) => {
                  const entry = period.entries[0]
                  const status = entry?.status ?? 'NOT_STARTED'
                  const statusBadge = getStatusBadge(status)
                  const isEditable = period.status === 'OPEN' && status !== 'LOCKED'

                  return (
                    <tr key={period.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{period.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{period.template.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge.classes}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditable ? (
                          <Link
                            href={`/periods/${period.id}/fill`}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                          >
                            {status === 'DRAFT' || !entry ? 'Nhập dữ liệu' : 'Xem / Chỉnh sửa'}
                          </Link>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Đã khóa</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {periods.length === 0 && (
            <div className="px-6 py-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Chưa có kỳ báo cáo nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

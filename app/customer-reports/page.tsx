import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function CustomerReportsPage() {
  const session = await getServerSession(authOptions)
  const user = session!.user!

  const reports = await prisma.customerReport.findMany({
    where: {
      rows: {
        some: { branchId: user.branchId },
      },
    },
    include: {
      template: {
        select: { name: true },
      },
      _count: {
        select: {
          rows: {
            where: { branchId: user.branchId },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate progress for each report
  // Fetch all templates upfront to avoid N+1 query
  const templateIds = Array.from(new Set(reports.map(r => r.templateId)))
  const templates = await prisma.reportTemplate.findMany({
    where: { id: { in: templateIds } },
    include: { fields: { where: { required: true } } },
  })
  const templateMap = new Map(templates.map(t => [t.id, t]))

  // Fetch all branch rows for these reports
  const branchRows = await prisma.customerRow.findMany({
    where: {
      reportId: { in: reports.map(r => r.id) },
      branchId: user.branchId,
    },
    include: {
      responses: true,
    },
  })

  // Group rows by reportId
  const rowsByReport = new Map<string, typeof branchRows>()
  reports.forEach(report => {
    rowsByReport.set(report.id, branchRows.filter(r => r.reportId === report.id))
  })

  const reportStats = reports.map((report) => {
    const template = templateMap.get(report.templateId)
    const requiredFields = template?.fields || []
    const reportRows = rowsByReport.get(report.id) || []

    const totalRows = reportRows.length
    const filledRows = reportRows.filter((row) => {
      if (requiredFields.length === 0) return true
      return requiredFields.every((field) =>
        row.responses.some((r) => r.fieldKey === field.key && r.value !== null && r.value !== '')
      )
    }).length

    return {
      ...report,
      totalRows,
      filledRows,
      progress: totalRows > 0 ? Math.round((filledRows / totalRows) * 100) : 0,
    }
  })

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; classes: string }> = {
      'OPEN': { text: 'Đang mở', classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
      'LOCKED': { text: 'Đã khóa', classes: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    }
    return badges[status] || badges['OPEN']
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
                  Báo Cáo Online - Phòng KHCN
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.fullName || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/periods"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Kỳ báo cáo
              </Link>
              <Link
                href="/customer-reports"
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Báo cáo KH
              </Link>
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
            Báo cáo khách hàng
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Điền phản hồi cho các khách hàng của chi nhánh
          </p>
        </div>

        {/* Reports grid */}
        {reportStats.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {reportStats.map((report) => {
              const statusBadge = getStatusBadge(report.status)
              const isEditable = report.status === 'OPEN'

              return (
                <div
                  key={report.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.name}
                        </h3>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge.classes}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {report.totalRows} khách hàng của chi nhánh • {report.filledRows}/{report.totalRows} đã điền ({report.progress}%)
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mẫu: {report.template.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Progress bar */}
                      <div className="hidden sm:block w-32">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Tiến độ</span>
                          <span>{report.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${report.progress}%` }}
                          />
                        </div>
                      </div>
                      {/* Action button */}
                      {isEditable ? (
                        <Link
                          href={`/customer-reports/${report.id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Điền →
                        </Link>
                      ) : (
                        <Link
                          href={`/customer-reports/${report.id}`}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                        >
                          Xem →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">Chưa có báo cáo khách hàng nào</p>
          </div>
        )}
      </main>
    </div>
  )
}

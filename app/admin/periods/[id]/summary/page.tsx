import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const period = await prisma.period.findUnique({
    where: { id },
    include: {
      template: {
        include: {
          fields: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  const entries = await prisma.entry.findMany({
    where: { periodId: id },
    include: {
      branch: { select: { id: true, name: true } },
      values: true,
    },
    orderBy: { branch: { name: 'asc' } },
  })

  const branches = entries.map((e) => ({
    id: e.branch.id,
    name: e.branch.name,
    status: e.status,
    values: e.values,
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link href="/admin/periods" className="text-blue-600 hover:text-blue-800">
            ← Back
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Summary: {period?.name}
          </h1>
        </div>

        <div className="mb-4">
          <a
            href={`/api/admin/periods/${id}/export/excel`}
            className="inline-block rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 mr-2"
          >
            Export Excel
          </a>
          <a
            href={`/api/admin/periods/${id}/export/pdf`}
            className="inline-block rounded-md bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700"
          >
            Export PDF
          </a>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Branch
                </th>
                {period?.template.fields.map((f) => (
                  <th
                    key={f.id}
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td className="border border-gray-200 px-4 py-2 text-sm font-medium">
                    {branch.name}
                  </td>
                  {period?.template.fields.map((f) => {
                    const value = branch.values.find(
                      (v) => v.templateFieldId === f.id
                    )
                    return (
                      <td
                        key={f.id}
                        className="border border-gray-200 px-4 py-2 text-sm text-center"
                      >
                        {value?.value ?? 0}
                      </td>
                    )
                  })}
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {branch.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

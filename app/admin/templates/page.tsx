import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TemplatesPage() {
  await requireAdmin()

  const templates = await prisma.template.findMany({
    include: { _count: { select: { fields: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Admin
          </Link>
        </div>

        <form action="/api/templates" method="POST" className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="flex gap-4">
            <input
              name="name"
              placeholder="Template name"
              required
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={`/admin/templates/${t.id}`}
              className="block rounded-lg bg-white p-4 shadow hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{t.name}</span>
                <span className="text-sm text-gray-500">{t._count.fields} fields</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { generatePDF } from '@/lib/export/pdf'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      branch: { select: { name: true } },
      values: true,
    },
    orderBy: { branch: { name: 'asc' } },
  })

  const columns = [
    { header: 'Branch', dataKey: 'branch' },
    ...period!.template.fields.map((f) => ({ header: f.label, dataKey: f.key })),
    { header: 'Status', dataKey: 'status' },
  ]

  const data = entries.map((entry) => {
    const row: Record<string, string | number> = {
      branch: entry.branch.name,
      status: entry.status,
    }

    entry.values.forEach((v) => {
      const field = period!.template.fields.find((f) => f.id === v.templateFieldId)
      if (field) row[field.key] = v.value.toFixed(2)
    })

    return row
  })

  const buffer = generatePDF(`Summary: ${period!.name}`, columns, data)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${period!.name}-summary.pdf"`,
    },
  })
}

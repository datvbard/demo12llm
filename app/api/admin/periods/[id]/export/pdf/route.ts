import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { generatePDF } from '@/lib/export/pdf'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Filter only child fields (with key) for export - parent fields are sections
    const exportableFields = period!.template.fields.filter((f) => f.key !== null)

    const columns = [
      { header: 'Branch', dataKey: 'branch' },
      ...exportableFields.map((f) => ({ header: f.label, dataKey: f.key! })),
      { header: 'Status', dataKey: 'status' },
    ]

    const data = entries.map((entry) => {
      const row: Record<string, string | number> = {
        branch: entry.branch.name,
        status: entry.status,
      }

      entry.values.forEach((v) => {
        const field = period!.template.fields.find((f) => f.id === v.templateFieldId)
        if (field && field.key) row[field.key] = v.value.toFixed(2)
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
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/periods/[id]/export/pdf', 'Failed to export PDF')
  }
}

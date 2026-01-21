import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { generatePDF } from '@/lib/export/pdf'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  try {
    await requireAdmin()
    const { id, branchId } = await params

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

    const entry = await prisma.entry.findUnique({
      where: {
        periodId_branchId: {
          periodId: id,
          branchId: branchId,
        },
      },
      include: { branch: true, values: true },
    })

    const columns = [
      { header: '#', dataKey: 'order' },
      { header: 'Field', dataKey: 'label' },
      { header: 'Value', dataKey: 'value' },
    ]

    const data = period!.template.fields.map((field) => {
      const value = entry?.values.find((v) => v.templateFieldId === field.id)
      return {
        order: field.order + 1,
        label: field.label,
        value: value?.value?.toFixed(2) ?? '0.00',
      }
    })

    const buffer = generatePDF(
      `${entry?.branch.name} - ${period!.name}`,
      columns,
      data
    )

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${entry?.branch.name}-${period!.name}.pdf"`,
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/periods/[id]/branch/[branchId]/export/pdf', 'Failed to export PDF')
  }
}

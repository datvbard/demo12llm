import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { generateExcel } from '@/lib/export/excel'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
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
    include: {
      branch: true,
      values: true,
    },
  })

  const columns = [
    { header: '#', key: 'order', width: 5 },
    { header: 'Field', key: 'label', width: 25 },
    { header: 'Key', key: 'key', width: 15 },
    { header: 'Value', key: 'value', width: 15 },
    { header: 'Formula', key: 'formula', width: 25 },
  ]

  const data = period!.template.fields.map((field) => {
    const value = entry?.values.find((v) => v.templateFieldId === field.id)
    return {
      order: field.order + 1,
      label: field.label,
      key: field.key,
      value: value?.value ?? 0,
      formula: field.formula ?? '',
    }
  })

  const buffer = await generateExcel(
    columns,
    data,
    `${entry?.branch.name} - ${period!.name}`
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${entry?.branch.name}-${period!.name}.xlsx"`,
    },
  })
}

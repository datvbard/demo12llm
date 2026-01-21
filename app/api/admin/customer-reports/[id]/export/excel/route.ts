import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { generateExcel } from '@/lib/export/excel'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const report = await prisma.customerReport.findUnique({
      where: { id },
      include: {
        template: { include: { fields: { orderBy: { order: 'asc' } } } },
        rows: {
          include: {
            branch: { select: { name: true } },
            responses: true,
          },
          orderBy: { rowIndex: 'asc' },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Customer report not found' },
        { status: 404 }
      )
    }

    // Build columns: original Excel columns + response fields
    const columns: Array<{ header: string; key: string; width?: number }> = []

    // Original customer data columns
    if (report.columns) {
      (report.columns as any[]).forEach((col: any) => {
        columns.push({ header: col.label, key: `data_${col.key}`, width: 15 })
      })
    }

    // Branch name column
    columns.push({ header: 'Chi nhánh', key: 'branch_name', width: 20 })

    // Response field columns
    report.template.fields.forEach((field) => {
      columns.push({ header: field.label, key: `response_${field.key}`, width: 20 })
    })

    // Build rows
    const data: Record<string, any>[] = report.rows.map((row) => {
      const rowData: Record<string, any> = {}

      // Original customer data
      Object.entries(row.customerData as any).forEach(([key, value]) => {
        rowData[`data_${key}`] = value
      })

      // Branch name
      rowData.branch_name = row.branch?.name || 'Unmapped'

      // Response values
      const responseMap = new Map(
        row.responses.map((r) => [r.fieldKey, r.value])
      )

      report.template.fields.forEach((field) => {
        const value = responseMap.get(field.key)
        if (field.type === 'CHECKBOX') {
          rowData[`response_${field.key}`] = value === true ? '✓' : ''
        } else if (field.type === 'DROPDOWN' && Array.isArray(field.options)) {
          const option = (field.options as any[]).find((o: any) => o.value === value)
          rowData[`response_${field.key}`] = option?.label || value || ''
        } else {
          rowData[`response_${field.key}`] = value || ''
        }
      })

      return rowData
    })

    const buffer = await generateExcel(columns, data, report.name)

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(report.name)}.xlsx"`,
      },
    })
  } catch (error: any) {
    console.error('[GET /api/admin/customer-reports/[id]/export/excel]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export Excel' },
      { status: 500 }
    )
  }
}

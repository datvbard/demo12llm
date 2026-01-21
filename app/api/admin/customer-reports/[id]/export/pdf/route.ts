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
    const columns: Array<{ header: string; dataKey: string }> = []

    // Original customer data columns
    if (report.columns) {
      (report.columns as any[]).forEach((col: any) => {
        columns.push({ header: col.label, dataKey: `data_${col.key}` })
      })
    }

    // Branch name column
    columns.push({ header: 'Chi nhánh', dataKey: 'branch_name' })

    // Response field columns
    report.template.fields.forEach((field) => {
      columns.push({ header: field.label, dataKey: `response_${field.key}` })
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

    const buffer = generatePDF(report.name, columns, data)

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(report.name)}.pdf"`,
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/customer-reports/[id]/export/pdf', 'Failed to export PDF')
  }
}

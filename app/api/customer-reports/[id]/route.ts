import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireBranch()

    const report = await prisma.customerReport.findUnique({
      where: { id },
      include: {
        template: {
          include: { fields: { orderBy: { order: 'asc' } } },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Customer report not found' },
        { status: 404 }
      )
    }

    // Get only rows for this branch
    const rows = await prisma.customerRow.findMany({
      where: {
        reportId: id,
        branchId: session.branchId,
      },
      include: {
        responses: true,
      },
      orderBy: { rowIndex: 'asc' },
    })

    return NextResponse.json({
      ...report,
      rows,
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/customer-reports/[id]', 'Failed to get customer report')
  }
}

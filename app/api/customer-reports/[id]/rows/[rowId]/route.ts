import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { updateResponseSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const { id, rowId } = await params
    const session = await requireBranch()

    // Verify row belongs to this branch and report
    const row = await prisma.customerRow.findFirst({
      where: {
        id: rowId,
        reportId: id,
        branchId: session.branchId,
      },
      include: { report: true },
    })

    if (!row) {
      return NextResponse.json(
        { error: 'Row not found or access denied' },
        { status: 404 }
      )
    }

    // Verify report is open
    if (row.report.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Report is locked and cannot be modified' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { responses } = updateResponseSchema.parse(body)

    // Upsert responses
    await prisma.$transaction(
      Object.entries(responses).map(([fieldKey, value]) =>
        prisma.customerRowResponse.upsert({
          where: {
            rowId_fieldKey: {
              rowId,
              fieldKey,
            },
          },
          create: {
            rowId,
            fieldKey,
            value,
            updatedBy: session.id,
          },
          update: {
            value,
            updatedBy: session.id,
          },
        })
      )
    )

    // Return updated row with responses
    const updatedRow = await prisma.customerRow.findUnique({
      where: { id: rowId },
      include: { responses: true },
    })

    return NextResponse.json(updatedRow)
  } catch (error) {
    return handleApiError(error, 'PATCH /api/customer-reports/[id]/rows/[rowId]', 'Failed to update responses')
  }
}

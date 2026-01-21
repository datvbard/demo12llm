import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { updateCustomerReportSchema } from '@/lib/validations/customer-report'
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
        template: {
          include: { fields: { orderBy: { order: 'asc' } } },
        },
        rows: {
          include: { branch: { select: { name: true } } },
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

    return NextResponse.json(report)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/customer-reports/[id]', 'Failed to get customer report')
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await req.json()
    const validatedData = updateCustomerReportSchema.parse(body)

    const report = await prisma.customerReport.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(report)
  } catch (error) {
    return handleApiError(error, 'PATCH /api/admin/customer-reports/[id]', 'Failed to update customer report')
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    await prisma.customerReport.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/customer-reports/[id]', 'Failed to delete customer report')
  }
}

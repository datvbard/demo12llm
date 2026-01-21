import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { updateCustomerReportSchema } from '@/lib/validations/customer-report'
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
  } catch (error: any) {
    console.error('[GET /api/admin/customer-reports/[id]]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get customer report' },
      { status: 500 }
    )
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
  } catch (error: any) {
    console.error('[PATCH /api/admin/customer-reports/[id]]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Customer report not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update customer report' },
      { status: 500 }
    )
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
  } catch (error: any) {
    console.error('[DELETE /api/admin/customer-reports/[id]]', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Customer report not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete customer report' },
      { status: 500 }
    )
  }
}

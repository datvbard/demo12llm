import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { updateTemplateSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const template = await prisma.reportTemplate.findUnique({
      where: { id },
      include: {
        fields: { orderBy: { order: 'asc' } },
        _count: { select: { reports: true } },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[GET /api/admin/report-templates/[id]]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get report template' },
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
    const validatedData = updateTemplateSchema.parse(body)

    const template = await prisma.reportTemplate.update({
      where: { id },
      data: validatedData,
      include: { fields: true },
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[PATCH /api/admin/report-templates/[id]]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update report template' },
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
    // Check if template has reports
    const reportCount = await prisma.customerReport.count({
      where: { templateId: id },
    })

    if (reportCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete template with ${reportCount} reports` },
        { status: 400 }
      )
    }

    await prisma.reportTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/admin/report-templates/[id]]', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to delete report template' },
      { status: 500 }
    )
  }
}

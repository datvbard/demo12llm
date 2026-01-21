import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
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
  } catch (error) {
    return handleApiError(error, '[GET /api/admin/report-templates/[id]]', 'Failed to get report template')
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
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as unknown as { errors: unknown }).errors },
        { status: 400 }
      )
    }
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }
    return handleApiError(error, '[PATCH /api/admin/report-templates/[id]]', 'Failed to update report template')
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
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }
    return handleApiError(error, '[DELETE /api/admin/report-templates/[id]]', 'Failed to delete report template')
  }
}

import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'
import { createFieldSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const fields = await prisma.reportResponseField.findMany({
      where: { templateId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(fields)
  } catch (error) {
    return handleApiError(error, '[GET /api/admin/report-templates/[id]/fields]', 'Failed to get fields')
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    // Verify template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validatedData = createFieldSchema.parse(body)

    // Get next order value if not provided
    let order = validatedData.order
    if (order === undefined) {
      const maxOrder = await prisma.reportResponseField.findFirst({
        where: { templateId: id },
        select: { order: true },
        orderBy: { order: 'desc' },
      })
      order = (maxOrder?.order ?? -1) + 1
    }

    const field = await prisma.reportResponseField.create({
      data: {
        ...validatedData,
        templateId: id,
        order,
      },
    })

    return NextResponse.json(field, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return handleApiError(error, '[POST /api/admin/report-templates/[id]/fields]', 'Failed to create field')
  }
}

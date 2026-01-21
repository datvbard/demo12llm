import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'
import { createTemplateSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [templates, total] = await Promise.all([
      prisma.reportTemplate.findMany({
        where,
        include: {
          _count: { select: { fields: true, reports: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reportTemplate.count({ where }),
    ])

    return NextResponse.json({
      templates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return handleApiError(error, '[GET /api/admin/report-templates]', 'Failed to get report templates')
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const validatedData = createTemplateSchema.parse(body)

    const session = await requireAdmin()
    const template = await prisma.reportTemplate.create({
      data: {
        ...validatedData,
        createdBy: session.id,
      },
      include: { fields: true },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as unknown as { errors: unknown }).errors },
        { status: 400 }
      )
    }
    return handleApiError(error, '[POST /api/admin/report-templates]', 'Failed to create report template')
  }
}

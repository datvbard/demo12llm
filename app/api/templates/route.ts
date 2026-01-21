import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    const templates = await prisma.template.findMany({
      include: { _count: { select: { fields: true, periods: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(templates)
  } catch (error) {
    return handleApiError(error, '[GET /api/templates]', 'Failed to get templates')
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin()

    const formData = await req.formData()
    const name = formData.get('name') as string

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: { name, createdBy: user.id },
    })

    return NextResponse.json(template)
  } catch (error) {
    return handleApiError(error, '[POST /api/templates]', 'Failed to create template')
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    // Check if template is used by any period
    const periodCount = await prisma.period.count({
      where: { templateId: id },
    })

    if (periodCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template that is in use by periods' },
        { status: 400 }
      )
    }

    // Delete template (cascade deletes fields)
    await prisma.template.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, '[DELETE /api/templates]', 'Failed to delete template')
  }
}

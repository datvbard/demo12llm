import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET() {
  try {
    await requireAdmin()
    const periods = await prisma.period.findMany({
      include: {
        template: { select: { name: true } },
        _count: { select: { entries: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(periods)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/periods', 'Failed to get periods')
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const formData = await req.formData()
    const name = formData.get('name') as string
    const templateId = formData.get('templateId') as string

    if (!name || !templateId) {
      return NextResponse.json(
        { error: 'Name and templateId are required' },
        { status: 400 }
      )
    }

    const period = await prisma.period.create({
      data: {
        name,
        templateId,
        status: 'OPEN',
      },
    })

    return NextResponse.json(period)
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/periods', 'Failed to create period')
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Period ID is required' },
        { status: 400 }
      )
    }

    // Delete all entries for this period first (cascade)
    await prisma.entry.deleteMany({
      where: { periodId: id },
    })

    // Delete the period
    await prisma.period.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/periods', 'Failed to delete period')
  }
}

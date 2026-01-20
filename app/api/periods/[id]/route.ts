import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBranch()
    const { id } = await params

    const period = await prisma.period.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Period not found' }, { status: 404 })
    }

    return NextResponse.json(period)
  } catch (error: any) {
    console.error('[GET /api/periods/:id]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get period' },
      { status: error.message === 'Not authenticated' ? 401 : 400 }
    )
  }
}

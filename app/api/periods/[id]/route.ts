import { requireBranch } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
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
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handleApiError(error, '[GET /api/periods/:id]', 'Failed to get period')
  }
}

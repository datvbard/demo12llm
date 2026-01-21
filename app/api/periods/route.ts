import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET() {
  try {
    const user = await requireBranch()

    const periods = await prisma.period.findMany({
      include: {
        template: {
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
        },
        entries: {
          where: { branchId: user.branchId },
          select: {
            id: true,
            status: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(periods)
  } catch (error) {
    return handleApiError(error, 'GET /api/periods', 'Failed to get periods')
  }
}

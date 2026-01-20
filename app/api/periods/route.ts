import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
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
}

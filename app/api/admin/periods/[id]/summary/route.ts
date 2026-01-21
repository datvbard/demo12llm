import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
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

    const entries = await prisma.entry.findMany({
      where: { periodId: id },
      include: {
        branch: { select: { id: true, name: true } },
        values: true,
      },
      orderBy: { branch: { name: 'asc' } },
    })

    const summary = {
      period,
      branches: entries.map((e) => ({
        id: e.branch.id,
        name: e.branch.name,
        status: e.status,
        values: e.values,
      })),
    }

    return NextResponse.json(summary)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/periods/[id]/summary', 'Failed to get summary')
  }
}

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

    const branches = await prisma.branch.findMany({
      include: {
        entries: {
          where: { periodId: id },
          select: {
            id: true,
            status: true,
            submittedAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(branches)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/periods/[id]/branches', 'Failed to get branches')
  }
}

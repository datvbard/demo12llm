import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(req: Request) {
  try {
    const session = await requireBranch()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined

    const reports = await prisma.customerReport.findMany({
      where: {
        status: status as any,
        rows: {
          some: { branchId: session.branchId },
        },
      },
      include: {
        template: {
          select: { name: true, fields: true },
        },
        _count: {
          select: {
            rows: {
              where: { branchId: session.branchId },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reports)
  } catch (error) {
    return handleApiError(error, 'GET /api/customer-reports', 'Failed to get customer reports')
  }
}

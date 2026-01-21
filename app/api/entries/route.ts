import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function POST(req: Request) {
  try {
    const user = await requireBranch()
    const { periodId } = await req.json()

    const entry = await prisma.entry.upsert({
      where: {
        periodId_branchId: {
          periodId,
          branchId: user.branchId!,
        },
      },
      create: {
        periodId,
        branchId: user.branchId!,
        status: 'DRAFT',
      },
      update: {},
    })

    return NextResponse.json(entry)
  } catch (error) {
    return handleApiError(error, 'POST /api/entries', 'Failed to create entry')
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireBranch()
    const { searchParams } = new URL(req.url)
    const periodId = searchParams.get('periodId')

    if (!periodId) {
      return NextResponse.json({ error: 'periodId is required' }, { status: 400 })
    }

    const entry = await prisma.entry.findUnique({
      where: {
        periodId_branchId: {
          periodId,
          branchId: user.branchId!,
        },
      },
      include: {
        values: {
          include: {
            templateField: true,
          },
        },
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    return handleApiError(error, 'GET /api/entries', 'Failed to get entry')
  }
}

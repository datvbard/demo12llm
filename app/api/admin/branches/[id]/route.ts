import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    // Check if branch has users
    const userCount = await prisma.user.count({
      where: { branchId: id },
    })

    if (userCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete branch with ${userCount} users. Please reassign or delete users first.` },
        { status: 400 }
      )
    }

    await prisma.branch.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/branches/[id]', 'Failed to delete branch')
  }
}

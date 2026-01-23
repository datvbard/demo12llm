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
        { error: `Không thể xóa chi nhánh có ${userCount} người dùng. Vui lòng chuyển hoặc xóa người dùng trước.` },
        { status: 400 }
      )
    }

    // Check if branch has entries
    const entryCount = await prisma.entry.count({
      where: { branchId: id },
    })

    if (entryCount > 0) {
      return NextResponse.json(
        { error: `Không thể xóa chi nhánh có ${entryCount} bài nộp. Vui lòng xóa bài nộp trước.` },
        { status: 400 }
      )
    }

    // Delete branch (CustomerRow will have branchId set to null via onDelete: SetNull)
    await prisma.branch.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/branches/[id]', 'Failed to delete branch')
  }
}

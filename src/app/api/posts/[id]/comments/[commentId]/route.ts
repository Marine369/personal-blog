import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "评论不存在" },
        { status: 404 }
      );
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "只能删除自己的评论" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ message: "评论已删除" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "删除评论失败" },
      { status: 500 }
    );
  }
}

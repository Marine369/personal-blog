import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      const count = await prisma.like.count({ where: { postId: id } });

      return NextResponse.json({ liked: false, count });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: id,
          userId,
        },
      });

      const count = await prisma.like.count({ where: { postId: id } });

      return NextResponse.json({ liked: true, count }, { status: 201 });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { error: "操作失败" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const count = await prisma.like.count({ where: { postId: id } });

    let userLiked = false;
    if (session?.user?.id) {
      const existing = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: session.user.id,
          },
        },
      });
      userLiked = !!existing;
    }

    return NextResponse.json({ count, userLiked });
  } catch (error) {
    console.error("Get likes error:", error);
    return NextResponse.json(
      { error: "获取点赞信息失败" },
      { status: 500 }
    );
  }
}

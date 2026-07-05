import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        likes: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, excerpt, coverImage, tags, published } =
      await request.json();

    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "只能编辑自己的文章" },
        { status: 403 }
      );
    }

    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      slug = generateSlug(title);
      const slugExists = await prisma.post.findUnique({ where: { slug } });
      if (slugExists && slugExists.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? existingPost.title,
        slug,
        content: content ?? existingPost.content,
        excerpt: excerpt ?? existingPost.excerpt,
        coverImage: coverImage ?? existingPost.coverImage,
        tags: tags ?? existingPost.tags,
        published: published ?? existingPost.published,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;

    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "只能删除自己的文章" },
        { status: 403 }
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: "文章已删除" });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    );
  }
}

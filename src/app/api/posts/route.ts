import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { published: true };

    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "获取文章列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { title, content, excerpt, coverImage, tags, published } =
      await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    let slug = generateSlug(title);

    // Ensure unique slug
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.slice(0, 150),
        coverImage: coverImage || null,
        tags: tags || null,
        published: published || false,
        authorId: session.user.id,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    );
  }
}

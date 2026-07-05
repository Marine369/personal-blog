import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { tags: true },
    });

    const tagMap = new Map<string, number>();

    for (const post of posts) {
      if (post.tags) {
        try {
          const tags: string[] = JSON.parse(post.tags);
          for (const tag of tags) {
            const trimmed = tag.trim();
            if (trimmed) {
              tagMap.set(trimmed, (tagMap.get(trimmed) || 0) + 1);
            }
          }
        } catch {
          // skip invalid JSON tags
        }
      }
    }

    const sortedTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json(sortedTags);
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      { error: "获取标签失败" },
      { status: 500 }
    );
  }
}

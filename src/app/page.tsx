import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BlogCard from "@/components/BlogCard";
import Pagination from "@/components/Pagination";

async function getPosts(page: number, tag?: string) {
  const pageSize = 10;
  const where: Record<string, unknown> = { published: true };
  if (tag) where.tags = { contains: tag };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

async function getTags() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { tags: true },
  });

  const tagMap = new Map<string, number>();
  for (const post of posts) {
    if (post.tags) {
      try {
        for (const t of JSON.parse(post.tags) as string[]) {
          const trimmed = t.trim();
          if (trimmed) tagMap.set(trimmed, (tagMap.get(trimmed) || 0) + 1);
        }
      } catch { /* skip */ }
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const tag = params.tag;

  const [postsData, tags] = await Promise.all([
    getPosts(page, tag),
    getTags(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {tag ? `标签: ${tag}` : "最新文章"}
        </h1>
        <p className="text-gray-500">
          {tag
            ? `筛选标签 "${tag}"，共 ${postsData.total} 篇文章`
            : "分享技术心得，记录学习历程"}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !tag
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            全部
          </Link>
          {tags.map((t) => (
            <Link
              key={t.tag}
              href={`/?tag=${encodeURIComponent(t.tag)}`}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                tag === t.tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t.tag} ({t.count})
            </Link>
          ))}
        </div>
      )}

      {postsData.data.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl text-gray-600 mb-2">还没有文章</h2>
          <p className="text-gray-400">
            {tag ? "该标签下暂无文章" : "快来写第一篇文章吧"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {postsData.data.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination
        page={postsData.page}
        totalPages={postsData.totalPages}
        baseUrl={tag ? `/?tag=${encodeURIComponent(tag)}` : "/"}
      />
    </div>
  );
}

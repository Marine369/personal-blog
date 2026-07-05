import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import Pagination from "@/components/Pagination";

interface TagCount {
  tag: string;
  count: number;
}

async function getPosts(page: number, tag?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", "10");
  if (tag) params.set("tag", tag);

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/posts?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  return res.json();
}

async function getTags() {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/tags`, { cache: "no-store" });

  if (!res.ok) {
    return [];
  }

  return res.json();
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

      {/* Tag Cloud */}
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
          {tags.map((t: TagCount) => (
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

      {/* Blog List */}
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
          {postsData.data.map(
            (post: {
              id: string;
              title: string;
              slug: string;
              excerpt: string | null;
              coverImage: string | null;
              tags: string | null;
              author: {
                id: string;
                name: string;
                avatar: string | null;
              };
              _count: { comments: number; likes: number };
              createdAt: string;
            }) => (
              <BlogCard key={post.id} post={post} />
            )
          )}
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

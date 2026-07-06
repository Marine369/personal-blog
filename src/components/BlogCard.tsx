import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: Record<string, any>;
}

export default function BlogCard({ post }: BlogCardProps) {
  let tags: string[] = [];
  try {
    tags = typeof post.tags === "string" ? JSON.parse(post.tags) : (Array.isArray(post.tags) ? post.tags : []);
  } catch { /* skip */ }

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
            {post.author.name?.charAt(0) || "U"}
          </div>
          <span>{post.author.name}</span>
          <span>·</span>
          <time>{formatDate(post.createdAt)}</time>
        </div>

        <Link href={`/blog/${post.slug}`} className="group">
          <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>💬 {post._count.comments} 评论</span>
            <span>❤️ {post._count.likes} 点赞</span>
          </div>

          {tags.length > 0 && (
            <div className="flex gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  {tag}
                </Link>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

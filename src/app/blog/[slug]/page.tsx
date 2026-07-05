import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

async function getPost(slug: string) {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/posts/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const tags: string[] = post.tags ? JSON.parse(post.tags) : [];

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm mb-4 inline-block"
        >
          ← 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
            {post.author.name?.charAt(0) || "U"}
          </div>
          <span>{post.author.name}</span>
          <span>·</span>
          <time>{formatDate(post.createdAt)}</time>
          <span>·</span>
          <span>{post._count.comments} 评论</span>
        </div>

        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-gray max-w-none mb-8 bg-white rounded-xl border border-gray-200 p-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Like */}
      <div className="flex items-center justify-center mb-8">
        <LikeButton postId={post.id} initialCount={post._count.likes} />
      </div>

      {/* Comments */}
      <CommentSection postId={post.id} initialComments={post.comments} />
    </article>
  );
}

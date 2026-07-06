"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!content.trim()) {
      setError("评论内容不能为空");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setContent("");
      } else {
        const data = await res.json();
        setError(data.error || "发表评论失败");
      }
    } catch {
      setError("发表评论失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      const res = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      alert("删除失败，请稍后重试");
    }
  };

  return (
    <section className="max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        评论 ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            session?.user ? "写下你的评论..." : "请先登录后再发表评论"
          }
          rows={3}
          disabled={!session?.user}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!session?.user || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "发表中..." : "发表评论"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-center text-gray-400 py-8">暂无评论，来抢沙发吧~</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                  {comment.author.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {comment.content}
              </p>
              {session?.user?.id === comment.authorId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-gray-400 hover:text-red-500 mt-2 transition-colors"
                >
                  删除
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

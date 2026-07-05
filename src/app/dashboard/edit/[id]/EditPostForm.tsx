"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(
  () => import("@/components/MarkdownEditor"),
  { ssr: false }
);

interface EditPostFormProps {
  postId: string;
  initialTitle: string;
  initialContent: string;
  initialExcerpt: string;
  initialTags: string;
  initialPublished: boolean;
}

export default function EditPostForm({
  postId,
  initialTitle,
  initialContent,
  initialExcerpt,
  initialTags,
  initialPublished,
}: EditPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [tagsInput, setTagsInput] = useState(initialTags);
  const [published, setPublished] = useState(initialPublished);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("标题和内容不能为空");
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().slice(0, 150),
          tags: tags.length > 0 ? JSON.stringify(tags) : null,
          published,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        router.push(`/blog/${post.slug}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "更新失败");
      }
    } catch {
      setError("更新失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入文章标题"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          内容 (Markdown)
        </label>
        <MarkdownEditor value={content} onChange={setContent} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          摘要
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="文章摘要，留空则自动使用内容前150字"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标签
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="用逗号分隔多个标签"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="published" className="text-sm text-gray-700">
          发布
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {submitting ? "保存中..." : "保存修改"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          取消
        </button>
      </div>
    </form>
  );
}

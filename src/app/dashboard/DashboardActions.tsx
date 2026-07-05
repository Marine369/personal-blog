"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇文章吗？此操作不可撤销。")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch {
      alert("删除失败，请稍后重试");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {deleting ? "删除中..." : "删除"}
    </button>
  );
}

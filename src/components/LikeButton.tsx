"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
}

export default function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/posts/${postId}/like`)
        .then((res) => res.json())
        .then((data) => setLiked(data.userLiked))
        .catch(() => {});
    }
  }, [session, postId]);

  const handleLike = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setLiked(data.liked);
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium transition-all ${
        liked
          ? "bg-red-50 text-red-500 border-2 border-red-200 hover:bg-red-100"
          : "bg-white text-gray-600 border-2 border-gray-200 hover:border-red-200 hover:text-red-500"
      } disabled:opacity-50`}
    >
      <span className={loading ? "animate-pulse" : ""}>
        {liked ? "❤️" : "🤍"}
      </span>
      <span>
        {liked ? "已点赞" : "点赞"} ({count})
      </span>
    </button>
  );
}

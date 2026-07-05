import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import DashboardActions from "./DashboardActions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // Middleware handles redirect
  }

  // Get posts from both server-side (for SSR) and client-side
  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    include: {
      _count: {
        select: { comments: true, likes: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的仪表盘</h1>
          <p className="text-gray-500">管理你的文章</p>
        </div>
        <Link
          href="/dashboard/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ✏️ 写新文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl text-gray-600 mb-2">还没有文章</h2>
          <p className="text-gray-400 mb-4">开始写你的第一篇文章吧</p>
          <Link
            href="/dashboard/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            写文章
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                  标题
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 hidden sm:table-cell">
                  状态
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 hidden md:table-cell">
                  评论/点赞
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 hidden lg:table-cell">
                  更新时间
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.published
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                    💬 {post._count.comments} · ❤️ {post._count.likes}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/edit/${post.id}`}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        编辑
                      </Link>
                      <DashboardActions postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

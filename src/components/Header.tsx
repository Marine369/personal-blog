"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            📝 Mary's Blog
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              首页
            </Link>

            {isLoading ? (
              <div className="w-16 h-8 bg-gray-200 animate-pulse rounded" />
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  写文章
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {session.user.name}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                登录
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

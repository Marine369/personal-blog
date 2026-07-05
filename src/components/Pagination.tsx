import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl?: string;
}

export default function Pagination({
  page,
  totalPages,
  baseUrl = "/",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <Link
          href={`${baseUrl}?page=${page - 1}`}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← 上一页
        </Link>
      )}

      <span className="text-sm text-gray-600 px-3">
        {page} / {totalPages}
      </span>

      {page < totalPages && (
        <Link
          href={`${baseUrl}?page=${page + 1}`}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          下一页 →
        </Link>
      )}
    </div>
  );
}

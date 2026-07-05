export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Mary's Blog — 记录学习与成长</p>
          <p>
            用{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Next.js
            </a>{" "}
            构建
          </p>
        </div>
      </div>
    </footer>
  );
}

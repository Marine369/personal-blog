import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditPostForm from "./EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== session.user.id) {
    redirect("/dashboard");
  }

  const tagsString = post.tags ? JSON.parse(post.tags).join(", ") : "";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">编辑文章</h1>
      <EditPostForm
        postId={post.id}
        initialTitle={post.title}
        initialContent={post.content}
        initialExcerpt={post.excerpt || ""}
        initialTags={tagsString}
        initialPublished={post.published}
      />
    </div>
  );
}

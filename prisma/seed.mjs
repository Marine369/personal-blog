import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = createClient({
  url: `file:${path.resolve(__dirname, "..", "dev.db")}`,
});

async function seed() {
  // Create user
  const id = crypto.randomBytes(12).toString("hex");
  const hash = await bcrypt.hash("123456", 12);
  const now = new Date().toISOString();

  await client.execute({
    sql: `INSERT OR REPLACE INTO User (id, name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, "小明", "admin@blog.com", hash, now, now],
  });
  console.log("User created:", id);

  // Create posts
  const postId1 = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: `INSERT INTO Post (id, title, slug, content, excerpt, published, tags, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    args: [
      postId1,
      "我的第一篇博客",
      "hello-world",
      "# Hello World\n\n这是我的第一篇博客文章！\n\n## 关于我\n\n我是一名热爱编程的学生，正在学习 Web 开发。\n\n## 代码示例\n\n```javascript\nconsole.log(\"Hello, World!\");\n```\n\n## 列个表\n\n- Next.js\n- React\n- TypeScript\n- Prisma",
      "这是我的第一篇博客文章！",
      JSON.stringify(["JavaScript", "入门"]),
      id,
      now,
      now,
    ],
  });
  console.log("Post 1 created:", postId1);

  const postId2 = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: `INSERT INTO Post (id, title, slug, content, excerpt, published, tags, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    args: [
      postId2,
      "Next.js 16 新特性介绍",
      "nextjs-16-features",
      "# Next.js 16 新特性\n\nNext.js 16 带来了许多令人兴奋的新特性。\n\n## Turbopack\n\n默认使用 Turbopack 打包，构建速度大幅提升。\n\n## Proxy 替代 Middleware\n\n新的 `proxy.ts` 文件约定替代了旧的 `middleware.ts`。\n\n## 更好的 Server Components\n\nReact Server Components 支持更加完善。\n\n> 提示：本文使用 Markdown 编写",
      "Next.js 16 新特性介绍",
      JSON.stringify(["Next.js", "React", "前端"]),
      id,
      now,
      now,
    ],
  });
  console.log("Post 2 created:", postId2);

  // Add comment
  const commentId = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: `INSERT INTO Comment (id, content, postId, authorId, createdAt) VALUES (?, ?, ?, ?, ?)`,
    args: [commentId, "写得很棒！期待更多文章~", postId1, id, now],
  });
  console.log("Comment created");

  // Add like
  const likeId = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: `INSERT INTO Like (id, postId, userId, createdAt) VALUES (?, ?, ?, ?)`,
    args: [likeId, postId1, id, now],
  });
  console.log("Like created");

  console.log("\nSeed data created successfully!");
  console.log("Login: admin@blog.com / 123456");
}

seed().catch(console.error);

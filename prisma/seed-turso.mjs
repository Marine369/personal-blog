// Run: TURSO_DATABASE_URL=xxx TURSO_AUTH_TOKEN=xxx node prisma/seed-turso.mjs
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seed() {
  const id = crypto.randomBytes(12).toString("hex");
  const hash = await bcrypt.hash("123456", 12);
  const now = new Date().toISOString();

  await client.execute({
    sql: "INSERT OR REPLACE INTO User (id, name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, "小明", "admin@blog.com", hash, now, now],
  });
  console.log("User created");

  const pid1 = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: "INSERT INTO Post (id, title, slug, content, excerpt, published, tags, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)",
    args: [
      pid1, "我的第一篇博客", "hello-world",
      "# Hello World\n\n这是我的第一篇博客文章！\n\n## 关于我\n\n热爱编程的学生，正在学习 Web 开发。\n\n```javascript\nconsole.log('Hello World!');\n```",
      "这是我的第一篇博客文章！",
      JSON.stringify(["JavaScript", "入门"]), id, now, now,
    ],
  });
  console.log("Post 1 created");

  const pid2 = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: "INSERT INTO Post (id, title, slug, content, excerpt, published, tags, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)",
    args: [
      pid2, "Next.js 16 新特性", "nextjs-16-features",
      "# Next.js 16 新特性\n\n## Turbopack\n默认使用 Turbopack 打包。\n\n## Proxy 替代 Middleware\n新的 `proxy.ts` 替代了 `middleware.ts`。\n\n## Server Components\nReact Server Components 更加完善。",
      "Next.js 16 新特性介绍",
      JSON.stringify(["Next.js", "React", "前端"]), id, now, now,
    ],
  });
  console.log("Post 2 created");

  const cid = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: "INSERT INTO Comment (id, content, postId, authorId, createdAt) VALUES (?, ?, ?, ?, ?)",
    args: [cid, "写得很棒！期待更多~", pid1, id, now],
  });
  console.log("Comment created");

  const lid = crypto.randomBytes(12).toString("hex");
  await client.execute({
    sql: "INSERT INTO Like (id, postId, userId, createdAt) VALUES (?, ?, ?, ?)",
    args: [lid, pid1, id, now],
  });
  console.log("Like created");

  console.log("\nDone! Login: admin@blog.com / 123456");
}

seed().catch(console.error);

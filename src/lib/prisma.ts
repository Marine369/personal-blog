import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // DATABASE_URL is "file:./dev.db" where ./ is relative to project root
  const relativePath = process.env.DATABASE_URL?.replace("file:", "") || "./dev.db";
  const dbPath = path.resolve(process.cwd(), relativePath);

  const adapter = new PrismaLibSql({
    url: `file:${dbPath}`,
  });

  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

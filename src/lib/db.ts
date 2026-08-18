import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client. Reuses the global instance in dev to avoid
 * exhausting DB connections during Next.js hot reloads.
 *
 * Defensive: if the generated client is missing (e.g. build-time page-data
 * collection before `prisma generate` ran), `PrismaClient` will be undefined.
 * We lazily create the instance so the module never crashes at import time —
 * only the actual DB call can fail (caught by the route's try/catch).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!PrismaClient) return null;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
}

export const db = (globalForPrisma.prisma ?? createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production" && db) {
  globalForPrisma.prisma = db;
}

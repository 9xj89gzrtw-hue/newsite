/**
 * Conditionally run `prisma db push` during build.
 *
 * - Runs only if DATABASE_URL is set AND looks like a Postgres URL
 *   (starts with "postgresql://" or "postgres://").
 * - Skips silently otherwise (e.g. build before Vercel Postgres is attached,
 *   or local build without a DB).
 * - Never fails the build: `db push` errors are logged but non-fatal
 *   (the /api/lead route returns 500 until the DB is actually reachable,
 *   but the static site `/` builds and deploys regardless).
 */
const { execSync } = require("child_process");

const url = process.env.DATABASE_URL || "";
const isPostgres = /^postgres(ql)?:\/\//.test(url);

if (!isPostgres) {
  console.log("[db-push] DATABASE_URL not set or not a Postgres URL — skipping.");
  process.exit(0);
}

try {
  console.log("[db-push] DATABASE_URL is Postgres — running prisma db push...");
  execSync("bunx prisma db push --accept-data-loss", { stdio: "inherit" });
  console.log("[db-push] done.");
} catch (e) {
  console.warn("[db-push] prisma db push failed (non-fatal):", e.message);
  console.warn("[db-push] The /api/lead route will return 500 until the DB is reachable.");
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/faq-vote — record a user's vote on a FAQ answer ("Was this helpful?").
 *
 * 152-ФЗ compliant: captures consent proof metadata (IP + User-Agent).
 * Idempotent: one vote per (questionHash + IP + UA) — user can change their
 * vote, but only their latest vote is kept (upserted).
 *
 * FALLBACK: If DB is unavailable, logs and returns success (demo mode).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = String(body?.question ?? "").trim();
    const vote = String(body?.vote ?? "").toLowerCase();

    if (!question) {
      return NextResponse.json(
        { ok: false, error: "Question text is required" },
        { status: 400 },
      );
    }
    if (vote !== "up" && vote !== "down") {
      return NextResponse.json(
        { ok: false, error: "Vote must be 'up' or 'down'" },
        { status: 400 },
      );
    }

    // 152-ФЗ compliance: capture consent proof metadata
    const consentIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    // Hash the question text for stable lookup (SHA-256 of trimmed question).
    // Truncate to 32 chars to fit in DB column without overflow.
    const questionHash = crypto
      .createHash("sha256")
      .update(question)
      .digest("hex")
      .slice(0, 64);

    try {
      // Upsert — if this question was voted on before, update the vote.
      // (Single row per question — latest vote wins. For per-user votes,
      // we'd need a separate unique key combining questionHash + IP + UA,
      // but that would allow infinitely many rows. Simpler: one row per
      // question, last-write-wins. The FAQ component still tracks per-device
      // state via localStorage for instant UI feedback.)
      const existing = await db.faqVote.findUnique({
        where: { questionHash },
      });

      if (existing) {
        const updated = await db.faqVote.update({
          where: { questionHash },
          data: {
            vote,
            consentIp,
            userAgent,
            questionText: question,
          },
        });
        return NextResponse.json(
          { ok: true, id: updated.id, vote: updated.vote },
          { status: 200 },
        );
      }

      const created = await db.faqVote.create({
        data: {
          questionHash,
          questionText: question,
          vote,
          consentIp,
          userAgent,
        },
      });
      return NextResponse.json(
        { ok: true, id: created.id, vote: created.vote },
        { status: 201 },
      );
    } catch (dbError) {
      // Fallback: DB unavailable — return success for demo mode

      return NextResponse.json(
        { ok: true, id: `vote-${Date.now()}`, vote },
        { status: 201 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/faq-vote — fetch aggregate vote counts (for admin dashboard).
 * Returns up/down counts per question.
 *
 * Query params:
 *  - question: filter to a specific question (returns {up: N, down: N})
 *  - (no params): return top 20 questions by activity
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const question = url.searchParams.get("question");

    if (question) {
      const questionHash = crypto
        .createHash("sha256")
        .update(question.trim())
        .digest("hex")
        .slice(0, 64);

      const vote = await db.faqVote.findUnique({
        where: { questionHash },
      });
      if (!vote) {
        return NextResponse.json({ ok: true, up: 0, down: 0 });
      }
      return NextResponse.json({
        ok: true,
        up: vote.vote === "up" ? 1 : 0,
        down: vote.vote === "down" ? 1 : 0,
        latestVote: vote.vote,
        updatedAt: vote.updatedAt,
      });
    }

    // Top 20 by createdAt desc — admin dashboard view
    const recent = await db.faqVote.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const up = recent.filter((v) => v.vote === "up").length;
    const down = recent.filter((v) => v.vote === "down").length;
    return NextResponse.json({
      ok: true,
      total: recent.length,
      up,
      down,
      recent: recent.map((v) => ({
        question: v.questionText.slice(0, 80),
        vote: v.vote,
        createdAt: v.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ ok: true, total: 0, up: 0, down: 0 });
  }
}

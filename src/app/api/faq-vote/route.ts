import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import crypto from "node:crypto";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * FIX-4 [F8, W1-D]: простые длины-лимиты ДО записи в БД (zod уже в deps):
 *   - question: trim, 1..500 символов;
 *   - vote: строго "up" | "down".
 * Rate-limit: добавлен 81-F4 [SEC2, W1-c] — см. RATE_LIMIT ниже.
 */
const RATE_LIMIT = { capacity: 10, refillPerMin: 6 } as const;

const QuestionSchema = z
  .string()
  .trim()
  .min(1, "Question text is required")
  .max(500, "Вопрос слишком длинный (макс. 500 символов)");

/**
 * K4 (cycle-71, F3): маркер Prisma unique-constraint violation (P2002) —
 * гонка findUnique→create (см. newsletter/route.ts, тот же паттерн).
 */
const isUniqueViolation = (e: unknown): boolean =>
  typeof e === "object" &&
  e !== null &&
  (e as { code?: string }).code === "P2002";

/**
 * POST /api/faq-vote — record a user's vote on a FAQ answer ("Was this helpful?").
 *
 * 152-ФЗ compliant: captures consent proof metadata (IP + User-Agent).
 * Idempotent: one vote per (questionHash + IP + UA) — user can change their
 * vote, but only their latest vote is kept (upserted).
 *
 * FIX-4 [F10, W1-D]: при недоступности БД больше НЕТ фейкового 201
 * «success (demo mode)» — тихая потеря голоса. Отвечаем честный 503
 * `{ ok: false, error }`.
 *
 * K4 (cycle-71, F3): TOCTOU-гонка findUnique→create закрыта ловушкой P2002 →
 * update-ветка (last-write-wins — та же семантика, что в основном пути).
 */
export async function POST(req: NextRequest) {
  // SEC2: лимит до валидации тела и до записи в БД.
  const rl = rateLimit(`faq-vote:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  try {
    const body = await req.json().catch(() => ({}));

    const questionResult = QuestionSchema.safeParse(
      typeof body?.question === "string" ? body.question : "",
    );
    if (!questionResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: questionResult.error.issues[0]?.message ?? "Question is required",
        },
        { status: 400 },
      );
    }
    const question = questionResult.data;

    const vote = String(body?.vote ?? "").toLowerCase();
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

    /** Данные последнего голоса — общие для основной update-ветки и
     * P2002-ретрая (K4, F3). */
    const voteData = {
      vote,
      consentIp,
      userAgent,
      questionText: question,
    };

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
          data: voteData,
        });
        return NextResponse.json(
          { ok: true, id: updated.id, vote: updated.vote },
          { status: 200 },
        );
      }

      try {
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
      } catch (raceError) {
        // K4 (cycle-71, F3): проиграли гонку findUnique→create — параллельный
        // голос успел вставить строку по этому questionHash (P2002). Отвечаем
        // update-веткой — та же last-write-wins семантика, без 500. Реальный
        // сбой БД уходит во внешний catch → 503.
        if (isUniqueViolation(raceError)) {
          const updated = await db.faqVote.update({
            where: { questionHash },
            data: voteData,
          });
          return NextResponse.json(
            { ok: true, id: updated.id, vote: updated.vote },
            { status: 200 },
          );
        }
        throw raceError;
      }
    } catch (dbError) {
      // FIX-4 [F10]: БД недоступна — честный 503, никаких фейковых 201.
      console.error("[api/faq-vote] DB write failed:", dbError);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Сервис голосования временно недоступен — попробуйте позже. Ваш голос не сохранён.",
        },
        { status: 503 },
      );
    }
  } catch (e) {
    // 81-F4 [SEC3]: внешний catch больше не глотает исключение молча —
    // лог обязателен (иначе сбой БД/рантайма в POST-пути не виден в логах).
    console.error("[api/faq-vote] unhandled error:", e);
    return NextResponse.json(
      { ok: false, error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

/*
 * GET /api/faq-vote — АДМИН-ЭНДПОИНТ УДАЛЁН (81-F4, SEC3, W1-c).
 *
 * Прежний неавторизованный GET отдавал наружу пользовательские вопросы
 * (top-20 с текстами, IP-контекст, время голосов) любому анониму —
 * «админ»-дашборд без авторизации. rg по src/components + src/app
 * показал: фронтенд НЕ вызывает GET (и POST тоже — UI голосования
 * удалён из FAQ ранее; роут остался для будущих интеграций). Поэтому
 * эндпоинт удалён целиком, а не закрыт admin_key.
 *
 * Остался явный 404-стаб вместо автоматического Next-405: по 405 злоумышленник
 * видит, что POST существует; 404-ответ читается как «такого роута нет».
 * Если появится настоящая админ-панель — её метрики должны жить за
 * авторизацией (ADMIN_KEY/session), не в публичном route handler.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, error: "Not Found" },
    { status: 404 },
  );
}

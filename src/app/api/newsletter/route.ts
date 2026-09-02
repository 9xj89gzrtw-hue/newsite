import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FIX-4 [F8, W1-D]: простые длины-лимиты ДО записи в БД (zod уже в deps):
 *   - email: trim + lowercase, ≤254 (RFC max), формат по EMAIL_REGEX;
 *   - source: trim, ≤100, optional.
 * Rate-limit НЕ добавляем (отдельная задача, W1-D F8 частично).
 */
const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Email слишком длинный (макс. 254 символа)")
  .regex(EMAIL_REGEX, "Некорректный формат email");

const SourceSchema = z
  .string()
  .trim()
  .max(100, "Поле source слишком длинное (макс. 100 символов)")
  .optional()
  .nullable();

/**
 * K4 (cycle-71, F3): маркер Prisma unique-constraint violation (P2002) —
 * гонка findUnique→create: параллельный POST успел вставить строку между
 * нашим чтением и записью. Сигнатурная проверка вместо импорта класса
 * из @prisma/client/runtime (легче и не тащит рантайм в бандл роута).
 */
const isUniqueViolation = (e: unknown): boolean =>
  typeof e === "object" &&
  e !== null &&
  (e as { code?: string }).code === "P2002";

/**
 * POST /api/newsletter — subscribe an email with 152-ФЗ consent proof.
 * Stores consent timestamp + IP + User-Agent as legal proof of consent.
 *
 * Idempotent: re-subscribing an existing email returns 200 with code ALREADY_SUBSCRIBED.
 *
 * FIX-4 [F10, W1-D]: при недоступности БД больше НЕТ фейкового 201
 * «success (demo mode)» — тихая потеря подписки. Отвечаем честный 503
 * `{ ok: false, error }` — клиент показывает ошибку, пользователь знает,
 * что подписка не сохранилась.
 *
 * K4 (cycle-71, F3): TOCTOU-гонка findUnique→create закрыта ловушкой P2002
 * → перезачитывание строки (идемпотентный ответ вместо 500).
 * Публичный GET удалён: он отдавал наружу число активных подписчиков
 * (метрика — не для анонимов) и маскировал сбой БД ответом active:0.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawEmail = typeof body?.email === "string" ? body.email : "";
    if (!rawEmail.trim()) {
      return NextResponse.json(
        { ok: false, error: "Email обязателен" },
        { status: 400 },
      );
    }
    const emailResult = EmailSchema.safeParse(rawEmail);
    if (!emailResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: emailResult.error.issues[0]?.message ?? "Некорректный email",
        },
        { status: 400 },
      );
    }
    const email = emailResult.data;

    const sourceResult = SourceSchema.safeParse(
      typeof body?.source === "string" ? body.source : null,
    );
    const source =
      sourceResult.success && sourceResult.data ? sourceResult.data : null;

    // 152-ФЗ compliance: capture consent proof metadata
    const consentIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    /** Реактивация отписанной строки — общая для основной ветки и
     * P2002-ретрая (K4, F3). */
    const reactivate = async (keepSource: string | null) =>
      db.subscriber.update({
        where: { email },
        data: {
          active: true,
          unsubscribedAt: null,
          consentDate: new Date(),
          consentIp,
          userAgent,
          source: source ?? keepSource,
        },
      });

    try {
      // Upsert — if email exists and was unsubscribed, reactivate; if new, create.
      const existing = await db.subscriber.findUnique({ where: { email } });

      if (existing) {
        if (existing.active) {
          return NextResponse.json(
            {
              ok: true,
              id: existing.id,
              code: "ALREADY_SUBSCRIBED",
            },
            { status: 200 },
          );
        }
        // Reactivate
        const updated = await reactivate(existing.source);
        return NextResponse.json(
          { ok: true, id: updated.id, code: "REACTIVATED" },
          { status: 200 },
        );
      }

      try {
        const sub = await db.subscriber.create({
          data: {
            email,
            source,
            consentAccepted: true,
            consentDate: new Date(),
            consentIp,
            userAgent,
            active: true,
          },
        });

        return NextResponse.json(
          { ok: true, id: sub.id, code: "SUBSCRIBED" },
          { status: 201 },
        );
      } catch (raceError) {
        // K4 (cycle-71, F3): проиграли гонку findUnique→create — параллельный
        // запрос вставил этот email между нашим чтением и записью (P2002).
        // Перезачитываем строку и отвечаем по её ФАКТИЧЕСКОМУ состоянию —
        // идемпотентно, без 500. Всё остальное (реальный сбой БД) — наружу
        // во внешний catch → 503.
        if (isUniqueViolation(raceError)) {
          const winner = await db.subscriber.findUnique({ where: { email } });
          if (winner) {
            if (winner.active) {
              return NextResponse.json(
                { ok: true, id: winner.id, code: "ALREADY_SUBSCRIBED" },
                { status: 200 },
              );
            }
            const updated = await reactivate(winner.source);
            return NextResponse.json(
              { ok: true, id: updated.id, code: "REACTIVATED" },
              { status: 200 },
            );
          }
          // P2002, а строки нет (параллельный DELETE успел) — честный сбой
          // следующего запроса, наружу → 503.
        }
        throw raceError;
      }
    } catch (dbError) {
      // FIX-4 [F10]: БД недоступна — честный 503, никаких фейковых 201.
      console.error("[api/newsletter] DB write failed:", dbError);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Сервис подписки временно недоступен — попробуйте позже. Ваш email не сохранён.",
        },
        { status: 503 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

/*
 * GET /api/newsletter — УДАЛЁН (K4, cycle-71, F3).
 *
 * Прежний публичный GET отдавал `{ ok: true, active: N }` — число активных
 * подписчиков наружу любому анониму (метрика не для публичного роута), а его
 * catch маскировал недоступность БД ответом `active: 0`. rg по src/ показывает,
 * что GET никто не вызывает (полоса подписки удалена из футера в C71) —
 * health-check-ценности роут не нёс. Если появится админ-панель — её метрики
 * должны жить за авторизацией, не в публичном route handler.
 */

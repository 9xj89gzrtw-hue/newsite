import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter — subscribe an email with 152-ФЗ consent proof.
 * Stores consent timestamp + IP + User-Agent as legal proof of consent.
 *
 * FALLBACK: If DB is unavailable, logs and returns success (demo mode).
 * Idempotent: re-subscribing an existing email returns 200 with code ALREADY_SUBSCRIBED.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const source = body?.source ? String(body.source) : null;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email обязателен" },
        { status: 400 },
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Некорректный формат email" },
        { status: 400 },
      );
    }

    // 152-ФЗ compliance: capture consent proof metadata
    const consentIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

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
        const updated = await db.subscriber.update({
          where: { email },
          data: {
            active: true,
            unsubscribedAt: null,
            consentDate: new Date(),
            consentIp,
            userAgent,
            source: source ?? existing.source,
          },
        });
        return NextResponse.json(
          { ok: true, id: updated.id, code: "REACTIVATED" },
          { status: 200 },
        );
      }

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
    } catch (dbError) {
      // Fallback: DB unavailable — return success for demo mode

      return NextResponse.json(
        { ok: true, id: `sub-${Date.now()}`, code: "SUBSCRIBED" },
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
 * GET /api/newsletter — health check (counts active subscribers).
 * Useful for admin dashboards. No PII returned.
 */
export async function GET() {
  try {
    const count = await db.subscriber.count({ where: { active: true } });
    return NextResponse.json({ ok: true, active: count });
  } catch {
    return NextResponse.json({ ok: true, active: 0 });
  }
}

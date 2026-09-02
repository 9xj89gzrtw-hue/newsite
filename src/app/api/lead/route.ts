import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memoryLeadStore } from "@/lib/lead-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Russian phone regex: +7/7/8 prefix + 10 digits, or bare 10 digits
 * (Cycle 40: bare 10-digit input previously 400'd — the client normalizes
 * to +7XXXXXXXXXX, the API accepts every common shape as defense in depth).
 */
const PHONE_REGEX = /^(\+7|7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

/**
 * POST /api/lead — create a lead with 152-ФЗ consent proof.
 * Stores consent timestamp + IP + User-Agent as legal proof of consent.
 * 
 * FALLBACK: If DB is unavailable, logs the lead and returns success (demo mode).
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> | null;
  try {
    body = (await req.json()) as Record<string, unknown> | null;
  } catch {
    // Cycle 70 (W2-B): пустое/битое тело — это ошибка КЛИЕНТА (4xx),
    // а не «внутренняя ошибка» 500. Раньше parse-исключение падало в
    // внешний catch → 500 без деталей.
    return NextResponse.json(
      { ok: false, error: "Некорректный формат запроса — ожидается JSON" },
      { status: 400 },
    );
  }
  try {
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const consentAccepted = Boolean(body?.consentAccepted);

    // 152-ФЗ: consent is REQUIRED to process personal data
    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Имя и телефон обязательны" },
        { status: 400 },
      );
    }
    if (!consentAccepted) {
      return NextResponse.json(
        { ok: false, error: "Требуется согласие на обработку персональных данных" },
        { status: 400 },
      );
    }

    // Phone validation: must match +7 XXX XXX-XX-XX format
    if (!PHONE_REGEX.test(phone.replace(/[^+0-9]/g, ""))) {
      return NextResponse.json(
        { ok: false, error: "Укажите телефон в формате +7 XXX XXX-XX-XX" },
        { status: 400 },
      );
    }

    /* Cycle 70 (W2-B): лимиты длин — без них 10КБ-строка писалась в БД
     * (замер: name 10000 симв. → 201). Спам-щит + защита sqlite-полей.
     * Границы согласованы с формой (hacc-booking): имя — human-scale,
     * message — развёрнутый комментарий, eventType — выбор из списка. */
    if (name.length > 100) {
      return NextResponse.json(
        { ok: false, error: "Имя слишком длинное (максимум 100 символов)" },
        { status: 400 },
      );
    }
    if (phone.length > 32) {
      return NextResponse.json(
        { ok: false, error: "Телефон слишком длинный" },
        { status: 400 },
      );
    }

    const eventType = body?.eventType ? String(body.eventType).slice(0, 100) : null;
    const guests = typeof body?.guests === "number" && Number.isFinite(body.guests) && body.guests >= 0 && body.guests <= 100000 ? Math.round(body.guests) : null;
    const budget = typeof body?.budget === "number" && Number.isFinite(body.budget) && body.budget >= 0 && body.budget <= 100000000 ? Math.round(body.budget) : null;
    const email = body?.email ? String(body.email).trim().slice(0, 254) || null : null;
    const message = body?.message ? String(body.message).trim().slice(0, 2000) || null : null;

    // 152-ФЗ compliance: capture consent proof metadata
    const consentIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    // Try to save to DB; fall back to in-memory store on failure.
    try {
      const lead = await db.lead.create({
        data: {
          name,
          phone,
          email,
          eventType,
          guests,
          budget,
          message,
          consentAccepted: true,
          consentDate: new Date(),
          consentIp,
          userAgent,
        },
      });

      return NextResponse.json({ ok: true, id: String(lead.id) }, { status: 201 });
    } catch (dbError) {
      // In-memory fallback — persists within server process lifetime.
      const lead = memoryLeadStore.create({
        name,
        phone,
        email,
        eventType,
        guests,
        budget,
        message,
        consentAccepted: true,
        consentDate: new Date(),
        consentIp,
        userAgent,
      });
      return NextResponse.json({ ok: true, id: String(lead.id) }, { status: 201 });
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}

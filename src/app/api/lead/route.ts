import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PHONE_PRETTY } from "@/lib/site-config";

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
 * K4 (cycle-71, F3): фейкового успеха при падении БД больше НЕТ. Раньше
 * лид писался в module-local массив (который никто никогда не читал) и
 * клиенту отдавался 201 «Заявка принята» → пользователь видел успех и
 * конфетти, а лид терялся бесследно. Теперь: честный 503 + структурный
 * console.error со ВСЕМИ полями лида (восстановление из логов сервера).
 * Клиент hacc-booking показывает toast с текстом из тела ответа и НЕ
 * запускает конфетти на не-2xx — см. его обработку `!res.ok`.
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

    // K4 (cycle-71, F3): единственная честная стратегия при сбое записи.
    // Module-local фоллбэк (lead-store.ts) удалён — он давал ложное чувство
    // безопасности: в проде его никто не читал, лид терялся молча.
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
      // Лид не сохранён — это потерянный бизнес. Двухступенчатая страховка:
      //  1) структурный лог со ВСЕМИ полями (timestamp + payload + ошибка) —
      //     из него лид восстанавливается руками по логам сервера;
      //  2) 503 + человекочитаемая ошибка — клиент показывает toast,
      //     конфетти (только на 2xx) не срабатывает, пользователь знает,
      //     что заявка НЕ прошла, и может позвонить.
      console.error(
        "[api/lead] DB write FAILED — lead NOT saved, recover manually from payload:",
        JSON.stringify(
          {
            at: new Date().toISOString(),
            lead: {
              name,
              phone,
              email,
              eventType,
              guests,
              budget,
              message,
              consentAccepted: true,
              consentDate: new Date().toISOString(),
              consentIp,
              userAgent,
            },
            error:
              dbError instanceof Error
                ? { name: dbError.name, message: dbError.message }
                : String(dbError),
          },
          null,
          2,
        ),
      );
      return NextResponse.json(
        {
          ok: false,
          error: `Сервис заявок временно недоступен — заявка не сохранилась. Позвоните нам: ${PHONE_PRETTY}, примем заказ по телефону.`,
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

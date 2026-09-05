import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { PHONE_PRETTY } from "@/lib/site-config";
import { normalizePhone } from "@/lib/phone";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 81-F4 [SEC2, W1-c]: rate-limit ДО парсинга тела и ДО записи в БД.
 * lead:${ip} — token-bucket 5 burst / 3 в минуту (lib/rate-limit.ts).
 * 6-й POST подряд → 429 + Retry-After.
 */
const RATE_LIMIT = { capacity: 5, refillPerMin: 3 } as const;

/**
 * 81-F4 [SEC5, W1-c]: ручная валидация (String() + if) переведена на
 * zod-схему — как в newsletter/faq-vote. Что изменилось против старого
 * кода (осознанно, по ТЗ 81-F4):
 *   - name: 2–80 символов (было: непусто и ≤100);
 *   - email: опционально, но СТРОГО валидный формат ≤254 (было: любая
 *     строка ≤254 писалась в БД — «email без формата»);
 *   - phone: 10–15 цифр после выкидывания не-цифр (было: жёсткий
 *     RU-regex; теперь международные номера проходят, а RU-шейпы
 *     нормализуются сервером через lib/phone.ts);
 *   - consentAccepted: строго literal true (Boolean() принимал "yes").
 * Правила eventType/guests/budget/message перенесены как есть: мягкие
 * (мусор → null, message/eventType усекаются, guests округляется).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NameSchema = z
  .string()
  .trim()
  .min(2, "Имя слишком короткое (минимум 2 символа)")
  .max(80, "Имя слишком длинное (максимум 80 символов)");

const PhoneSchema = z
  .string()
  .trim()
  .max(32, "Телефон слишком длинный")
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Укажите телефон в формате +7 XXX XXX-XX-XX");

/** Email: опционален — "", null, undefined → null; иначе валидный ≤254.
 * (regex, а не z.email(): тот режет кириллические домены (почта.рф) —
 * тот же паттерн и то же сообщение, что в newsletter, для консистентности.) */
const EmailSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .max(254, "Email слишком длинный (макс. 254 символа)")
      .regex(EMAIL_REGEX, "Некорректный формат email"),
  ])
  .nullish()
  .transform((v) => (v ? v : null));

const ConsentSchema = z.literal(true, {
  error: "Требуется согласие на обработку персональных данных",
});

/** eventType: строка ≤100; мусор/отсутствие → null (как в старом коде). */
const EventTypeSchema = z
  .string()
  .trim()
  .max(100, "Поле eventType слишком длинное (макс. 100 символов)")
  .nullish()
  .catch(null)
  .transform((v) => (v && v.length > 0 ? v : null));

/** guests: число 0–100000, округление; мусор/вне диапазона → null (как было). */
const GuestsSchema = z
  .number()
  .finite()
  .min(0)
  .max(100000)
  .transform((v) => Math.round(v))
  .nullish()
  .catch(null)
  .transform((v) => v ?? null);

/** budget: число 0–100000000, округление; мусор/вне диапазона → null (как было). */
const BudgetSchema = z
  .number()
  .finite()
  .min(0)
  .max(100000000)
  .transform((v) => Math.round(v))
  .nullish()
  .catch(null)
  .transform((v) => v ?? null);

/** message: усечение до 2000 (не 400 — как в старом коде), пустое → null. */
const MessageSchema = z
  .string()
  .nullish()
  .catch(null)
  .transform((v) => {
    const s = typeof v === "string" ? v.trim().slice(0, 2000) : "";
    return s.length > 0 ? s : null;
  });

const LeadSchema = z.object({
  name: NameSchema,
  phone: PhoneSchema,
  email: EmailSchema,
  consentAccepted: ConsentSchema,
  eventType: EventTypeSchema,
  guests: GuestsSchema,
  budget: BudgetSchema,
  message: MessageSchema,
});

/**
 * POST /api/lead — create a lead with 152-ФЗ consent proof.
 * Stores consent timestamp + IP + User-Agent as legal proof of consent.
 *
 * K4 (cycle-71, F3): фейкового успеха при падении БД больше НЕТ — честный
 * 503 + структурный console.error со ВСЕМИ полями лида (восстановление из
 * логов сервера). Клиент hacc-booking показывает toast с текстом из тела
 * ответа и НЕ запускает конфетти на не-2xx — см. его обработку `!res.ok`.
 */
export async function POST(req: NextRequest) {
  // SEC2: лимит ДО валидации тела и ДО записи в БД — даже мусорный спам
  // не должен доходить до parse/БД.
  const rl = rateLimit(`lead:${getClientIp(req)}`, RATE_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // Cycle 70 (W2-B): пустое/битое тело — ошибка КЛИЕНТА (4xx), не 500.
    return NextResponse.json(
      { ok: false, error: "Некорректный формат запроса — ожидается JSON" },
      { status: 400 },
    );
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Некорректные данные заявки",
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // SEC5: серверная нормализация телефона — единый источник (lib/phone.ts).
  // Клиент шлёт уже нормализованный +7XXXXXXXXXX (hacc-booking), но прямой
  // POST (curl/bot) с «9991234567»/«8-999-…» теперь тоже ляжет в БД
  // канонически.
  const phone = normalizePhone(data.phone);

  // 152-ФЗ compliance: capture consent proof metadata
  // 81-W2F3 [G MAJOR #2 «XFF-спуфинг»]: consentIp теперь через getClientIp
  // (lib/rate-limit) — единая модель XFF-доверия с rate-limiter'ом
  // (прод за Caddy-шлюзом: шлюз ПЕРЕЗАПИСЫВАЕТ XFF → одиночная запись;
  // Vercel: платформа ДОБАВЛЯЕТ реальный IP к клиентскому XFF → последняя
  // запись). Прежняя локальная копия брала первый элемент XFF безусловно —
  // на платформах с append-моделью это спуфаемое значение в юридическом
  // proof-поле (согласие 152-ФЗ, consentIp). "local" = прямой запрос без
  // прокси-заголовков (dev/health) → null, как раньше при отсутствии XFF.
  const clientIp = getClientIp(req);
  const consentIp = clientIp === "local" ? null : clientIp;
  const userAgent = req.headers.get("user-agent") || null;

  // K4 (cycle-71, F3): единственная честная стратегия при сбое записи —
  // 503 + человекочитаемая ошибка: клиент показывает toast, конфетти (только
  // на 2xx) не срабатывает, пользователь знает, что заявка НЕ прошла, и
  // может позвонить. Лог при сбое — БЕЗ PII (81-W2F3, см. catch ниже):
  // имя/телефон/email/сообщение больше не покидают процесс.
  try {
    const lead = await db.lead.create({
      data: {
        name: data.name,
        phone,
        email: data.email,
        eventType: data.eventType,
        guests: data.guests,
        budget: data.budget,
        message: data.message,
        consentAccepted: true,
        consentDate: new Date(),
        consentIp,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true, id: String(lead.id) }, { status: 201 });
  } catch (dbError) {
    /* 81-W2F3 [G MAJOR #6 «PII в логах»]: прежде console.error
       сериализовал ПОЛНЫЙ пейлоад лида (имя/телефон/email/message/
       consentIp/UA) — персональные данные утекали в pm2/логи хостинга
       (152-ФЗ + GDPR-практика: логи — не место для PII). Теперь — только
       безопасная сводка для корреляции инцидента: leadIdHint = первые
       8 hex sha256(нормализованный телефон) — однонаправленный хэш,
       персона не восстанавливается, но когда клиент позвонит (503-текст
       просит позвонить), оператор по времени инцидента + номеру связывает
       обращение с записью в логе. */
    const leadIdHint = createHash("sha256")
      .update(phone)
      .digest("hex")
      .slice(0, 8);
    console.error(
      JSON.stringify({
        event: "lead_db_error",
        at: new Date().toISOString(),
        leadIdHint,
        error:
          dbError instanceof Error
            ? `${dbError.name}: ${dbError.message}`
            : String(dbError),
      }),
    );
    return NextResponse.json(
      {
        ok: false,
        error: `Сервис заявок временно недоступен — заявка не сохранилась. Позвоните нам: ${PHONE_PRETTY}, примем заказ по телефону.`,
      },
      { status: 503 },
    );
  }
}

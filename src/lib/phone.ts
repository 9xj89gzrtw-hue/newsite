/**
 * 81-F4 [SEC5, W1-c]: серверная нормализация телефона — ЕДИНЫЙ источник
 * истины. Раньше только клиент (hacc-booking.tsx / contact.tsx) приводил
 * ввод к +7XXXXXXXXXX; сервер писал в БД как есть — прямой POST мимо
 * браузера (curl/bot) клал сырую строку. Логика скопирована 1:1 из
 * клиентской normalizePhone (hacc-booking.tsx, Cycle 40) — теперь обе
 * стороны сходятся к одному каноническому формату независимо.
 *
 * Правила (по количеству цифр после выкидывания не-цифр):
 *  - 10 цифр («9991234567», без 7/8) → prepend +7;
 *  - 11 цифр с ведущей 8 → 8 заменяется на +7;
 *  - 11 цифр с ведущей 7 → +7XXXXXXXXXX;
 *  - прочее (12–15 цифр — международный формат) → как есть, trимmed.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "+7" + digits;
  if (digits.length === 11 && digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.length === 11 && digits.startsWith("7")) return "+" + digits;
  return raw.trim();
}

/**
 * c84 (Impl-D foundation): lite-device — единый детектор «слабого» окружения.
 *
 * Проблема владельца: «на слабом компьютере сайт жестко тормозит» и «на
 * Android в экономном режиме некоторые функции не работают».
 *
 * Рецепт — adaptive loading (Osmani, web.dev; продакшн-паттерн
 * Facebook/eBay/Tinder, см. docs/C84-MOBILE-UX-RESEARCH.md §5.1):
 * сигналы NetworkInformation + deviceMemory + hardwareConcurrency гейтят
 * тяжёлый рантайм (Lenis rAF, canvas-частицы, фоновые видео-лупы).
 *
 * API (стабильный контракт для c84-реализаторов A/B/C/D):
 *   isLiteDevice()          — синхронный ответ, кэшируется после первого
 *                             вызова (модуль-синглтон; SSR → false).
 *   subscribeLiteDevice(cb) — подписка на изменение сети (connection.change);
 *                             возвращает отписку. Прагматика: даунгрейд
 *                             постоянен на сессию (кэш), cb дёргается только
 *                             при ПЕРВЫХ признаках lite (включение Data
 *                             Saver по ходу сессии). React-хук поверх —
 *   src/hooks/use-lite-device.ts (useLiteDevice: false на сервере и до
 *   монтирования — гидро-паритет: SSR рендерит «полную» версию, lite-
 *   даунгрейд применяется после mount, без hydration mismatch).
 *
 * Порог (рецепт Osmani): saveData || 2g || deviceMemory≤2 || cores≤4.
 * Вверх НЕ переконфигурировать без замеров (грабля §43: числа-гейты
 * пересматриваются только с новыми прямиными замерами).
 */

/** Признаки «слабого» окружения — вызывать только на клиенте. */
function detect(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  const conn = nav.connection;
  const saveData = conn?.saveData === true;
  const et = String(conn?.effectiveType ?? "");
  const slowNet = et === "slow-2g" || et === "2g";
  const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 2;
  const cores = nav.hardwareConcurrency;
  const lowCores = typeof cores === "number" && cores > 0 && cores <= 4;
  return saveData || slowNet || lowMem || lowCores;
}

let cached: boolean | null = null;

/** Синхронный детект с кэшем (модуль живёт один на вкладку). */
export function isLiteDevice(): boolean {
  if (cached === null) cached = detect();
  return cached;
}

/** Сброс кэша — только для тестов. */
export function __resetLiteCache(): void {
  cached = null;
}

/**
 * Подписка на «включение» lite по ходу сессии (Data Saver / деградация
 * сети). Даунгрейд односторонний: из lite не выходим (апгрейд посреди
 * сессии раскачает уже-выгруженные видео/инстансы).
 * c84-F3 (критик C, MINOR «кэш может перевернуться true→false»): при
 * connection.change с was=true пересчёт мог ОЧИСТИТЬ кэш в false (сеть
 * «поправилась») — модульные вызовы isLiteDevice() видели бы full при
 * живом lite-стейте хуков (рассинхрон веток). Фикс: кэш лерпится только
 * ВВЕРХ (в lite), никогда вниз — контракт односторонности теперь и в
 * данных, не только в подписчике.
 */
export function subscribeLiteDevice(cb: () => void): () => void {
  if (typeof navigator === "undefined") return () => {};
  const nav = navigator as Navigator & {
    connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
  };
  const conn = nav.connection;
  if (!conn || typeof conn.addEventListener !== "function") return () => {};
  const onChange = () => {
    const was = cached ?? false;
    if (!was && detect()) {
      cached = true;
      cb();
    }
  };
  conn.addEventListener("change", onChange);
  return () => conn.removeEventListener("change", onChange);
}

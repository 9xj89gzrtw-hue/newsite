/**
 * c85 (fix iPhone): lite-device — единый детектор «слабого» окружения.
 *
 * ПРОБЛЕМА c84 (жалобы владельца: «видео hero перестало воспроизводиться
 * на айфоне», «много анимации перестало работать даже на айфоне»):
 * гейт `hardwareConcurrency ≤ 4` ложился на КАЖДЫЙ iPhone — Safari
 * КЛАМПИТ hardwareConcurrency к 4 (caniuse: «Safari clamps this property
 * to 4 or 8 cores, to prevent device fingerprinting»), т.е. на WebKit
 * число НЕ отражает мощность железа. Все iPhone попадали в lite → видео
 * гасилось, анимации выключались. Аналогично Chrome на iOS = WebKit.
 *
 * РЕШЕНИЕ c85 (двухконтурное, «верификация живым — только живым» §1.9):
 *   КОНТУР 1 (статический, мгновенный): saveData || 2g || deviceMemory≤2
 *   — сигналы, которые ЛОЖЬ не говорят; cores≤4 — ТОЛЬКО на не-WebKit
 *   браузерах (Chromium/Firefox сообщают реальные ядра).
 *   КОНТУР 2 (живой, FPS-зонд): первый реальный скролл пользователя —
 *   2.2с замер межкадровых интервалов; p80 > 40ms при ≥20 кадрах =
 *   страница не держит ~25fps на ЭТОМ железе → честный даунгрейд в lite
 *   (односторонний, как и connection-даунгрейд). Ловит слабые ПК без
 *   ложных срабатываний на мощных (на мощных скролл держит 60/120).
 *
 * API (контракт c84 сохранён):
 *   isLiteDevice()          — синхронный ответ, кэш после первого вызова
 *                             (модуль-синглтон; SSR → false).
 *   subscribeLiteDevice(cb) — подписка на ВКЛЮЧЕНИЕ lite (connection.change
 *                             ИЛИ FPS-зонд); возвращает отписку. Даунгрейд
 *                             односторонний: из lite не выходим.
 *   startFpsProbeOnce()     — запуск живого зонда (идемпотентен). Вызывает
 *                             LenisProvider на монте; зонд спит до первого
 *   React-хук — src/hooks/use-lite-device.ts (гидро-паритет: SSR false).
 *
 * Порог FPS (§43 — числа только с замерами): p80 > 40ms (≤25fps
 * устойчиво). Калибровка живыми замерами c85: headless-SwiftShader
 * (прокси слабого ПК) — скролл p80 66–100ms (ловим); idle реального
 * GPU-браузера — 16.7–20ms, 30Hz-сберегающий ноутбук — 33ms (НЕ ловим:
 * машина жива, beauté сохраняем); слабые ПК из жалобы c84 (20–35fps на
 * софт-рендере) — p80 35–70ms (ловим). 26ms-порог был бы ложным на
 * 30Hz-машинах — поднят до 40ms после замеров.
 */

/** WebKit-браузер = клампит cores (Safari все платформы, любой iOS-браузер). */
function isWebKitBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // Все браузеры на iOS — WebKit (вкл. Chrome iOS); Safari на macOS.
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariDesktop = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
  return isIOS || isSafariDesktop;
}

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
  /* c85: cores-гейт НЕ применяется на WebKit (клампинг 4/8 — ложные
     срабатывания на всех iPhone; слабость WebKit-девайса поймает FPS-зонд).
     На Chromium/Firefox число честное: ≤4 ядра = реальный бюджет рендера. */
  const lowCores =
    !isWebKitBrowser() &&
    typeof nav.hardwareConcurrency === "number" &&
    nav.hardwareConcurrency > 0 &&
    nav.hardwareConcurrency <= 4;
  return saveData || slowNet || lowMem || lowCores;
}

let cached: boolean | null = null;
/** Подписчики «включения lite» (connection.change + FPS-зонд). */
const listeners = new Set<() => void>();

/** Односторонний переход в lite: кэш лерпится ТОЛЬКО ВВЕРХ (c84-F3). */
function becomeLite(): void {
  if (cached === true) return;
  cached = true;
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      /* подписчик не должен валить детектор */
    }
  }
}

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
 * сети / FPS-зонд). Даунгрейд односторонний: из lite не выходим
 * (апгрейд посреди сессии раскачает уже-выгруженные видео/инстансы).
 */
export function subscribeLiteDevice(cb: () => void): () => void {
  if (typeof navigator === "undefined") return () => {};
  listeners.add(cb);
  const nav = navigator as Navigator & {
    connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
  };
  const conn = nav.connection;
  if (!conn || typeof conn.addEventListener !== "function") return () => listeners.delete(cb);
  const onChange = () => {
    if (!cached && detect()) becomeLite();
  };
  conn.addEventListener("change", onChange);
  return () => {
    conn.removeEventListener("change", onChange);
    listeners.delete(cb);
  };
}

/* ══════════ КОНТУР 2: живой FPS-зонд (c85) ══════════ */

let probeStarted = false;

/**
 * FPS-зонд: спит до первого пользовательского скролла, затем 2.2с мерит
 * межкадровые интервалы rAF. p80 > 26ms при ≥50 кадрах → becomeLite().
 * Идемпотентен (один зонд на вкладку, guard-флаг). Вызывается на монте
 * LenisProvider'ом — раньше любых тяжёлых сцен нет, стартовые long-task'ы
 * гидратации в окно НЕ попадают (зонд стартует с первым скроллом, а не с
 * загрузкой). Большие паузы (>250мс — переключение таба) выбрасываются.
 * prefers-reduced-motion: зонд не нужен — тяжёлые анимации уже выключены.
 */
export function startFpsProbeOnce(): void {
  if (probeStarted || typeof window === "undefined") return;
  probeStarted = true;
  if (cached === true) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const WINDOW_MS = 2200;
  const P80_THRESHOLD_MS = 40;
  /* c85-фикс (грабля порога): MIN_FRAMES=50 недостижим на самых тяжёлых
     девайсах (2.2с / 50мс-кадры = 44 кадра — и они НЕ ловились!). Теперь:
     ≥20 кадров — решение по p80; 1–19 кадров — кадры настолько редки,
     что это уже ≤9fps — lite без статистики. */
  const MIN_FRAMES = 20;
  const GAP_MS = 250;

  const onFirstScroll = () => {
    window.removeEventListener("scroll", onFirstScroll, true);
    const deltas: number[] = [];
    let last = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (last > 0) {
        const d = now - last;
        if (d > 0 && d < GAP_MS) deltas.push(d);
      }
      last = now;
      if (now - t0 < WINDOW_MS) {
        requestAnimationFrame(tick);
        return;
      }
      if (cached !== true) {
        if (deltas.length >= MIN_FRAMES) {
          deltas.sort((a, b) => a - b);
          const p80 = deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * 0.8))];
          if (p80 > P80_THRESHOLD_MS) becomeLite();
        } else if (deltas.length > 0) {
          /* ≤19 кадров за 2.2с = ≤9fps — уже за пределами «плавно». */
          becomeLite();
        }
      }
    };
    requestAnimationFrame(tick);
  };

  /* capture: ловит и Lenis-скролл (wheel → transform), и нативный. */
  window.addEventListener("scroll", onFirstScroll, { capture: true, passive: true });
}

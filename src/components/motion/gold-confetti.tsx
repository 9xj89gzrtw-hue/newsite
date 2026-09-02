"use client";

/**
 * fireGoldConfetti(originEl?) — золотой салют на конверсию (Task ID: 1-c2).
 *
 * ==========================================================================
 * API ДЛЯ ОРКЕСТРАТОРА (интеграция в hacc-booking — файл чужой, НЕ трогаю):
 *
 *   import { fireGoldConfetti } from "@/components/motion/gold-confetti";
 *
 *   // при успешной отправке заявки (успех-стейт формы, не на каждый клик):
 *   fireGoldConfetti();                          // разлёт из центра экрана
 *   fireGoldConfetti(submitButtonRef.current);   // разлёт из кнопки «Отправить»
 *
 * Императивная утилита без своего React-дерева: сама создаёт fixed-canvas
 * (z-index 9990, pointer-events:none — ничего не перекрывает кликабельно),
 * рисует ~90–120 частиц золотой палитры (#C9A227/#E5C76B/#8A6D1F/#F5E6B8),
 * физика: гравитация 0.15/кадр, инерция разлёта из точки, вращение,
 * «флаттер»-переворот плашек, длительность ~1.2s, канвас удаляется сам.
 * Соединять ТОЛЬКО с реальной конверсией (успех формы), не со спам-кликами
 * (внутри есть защита от наложения >2 салютов).
 * prefers-reduced-motion → noop. SSR → noop.
 * ==========================================================================
 */

/** Кап DPR для канваса салюта. */
const DPR_CAP = 1.5;
/** Полная длительность салюта, ms. */
const DURATION_MS = 1200;
/** Максимальное число одновременно играющих салютов (анти-спам). */
const MAX_CONCURRENT = 2;

/** Золотая палитра: базовое золото, светлое, тёмное, кремовое сияние. */
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [201, 162, 39], // #C9A227
  [229, 199, 107], // #E5C76B
  [138, 109, 31], // #8A6D1F
  [245, 230, 184], // #F5E6B8
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vrot: number;
  color: string;
  shape: "flake" | "dot";
};

/** Счётчик активных салютов — защита от спама одинаковой утилитой. */
let concurrent = 0;

export function fireGoldConfetti(originEl?: HTMLElement): void {
  // SSR и reduce-motion — тихий noop: салют чисто декоративное движение
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (concurrent >= MAX_CONCURRENT) return;
  concurrent += 1;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

  const canvas = document.createElement("canvas");
  // inline-стили вместо css-файла: утилита самодостаточна и живёт вне
  // React-дерева (оркестратор может импортировать её из любого места)
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "9990";
  canvas.style.pointerEvents = "none";
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    concurrent -= 1;
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Точка разлёта: центр originEl (если элемент жив) или центр экрана
  let ox = vw / 2;
  let oy = vh / 2;
  if (originEl && originEl.isConnected) {
    const r = originEl.getBoundingClientRect();
    if (r.width > 0 || r.height > 0) {
      ox = r.left + r.width / 2;
      oy = r.top + r.height / 2;
    }
  }

  const count = vw < 768 ? 90 : 120; // 90–120
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // разлёт: широкий верхний конус (как хлопушка), не полный круг
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
    const speed = 5 + Math.random() * 7;
    const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)] as readonly [
      number,
      number,
      number,
    ];
    parts.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 4,
      h: 3 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.5,
      color: `rgb(${r}, ${g}, ${b})`,
      shape: Math.random() < 0.25 ? "dot" : "flake",
    });
  }

  let raf = 0;
  let done = false;
  let failsafe: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(failsafe);
    canvas.remove();
    concurrent -= 1;
  };

  const t0 = performance.now();
  const frame = (now: number) => {
    const elapsed = now - t0;
    if (elapsed >= DURATION_MS) {
      cleanup();
      return;
    }
    ctx.clearRect(0, 0, vw, vh);
    // мягкое затухание в последней трети жизни
    const fade = Math.min(1, (DURATION_MS - elapsed) / (DURATION_MS * 0.3));
    let alive = 0;
    ctx.globalAlpha = fade;
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // гравитация 0.12–0.18 → 0.15
      p.vx *= 0.985; // сопротивление воздуха
      p.rot += p.vrot;
      if (p.y > -60 && p.y < vh + 40 && p.x > -40 && p.x < vw + 40) alive += 1;

      if (p.shape === "dot") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + p.w * 0.15, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // плашка с «флаттером»: видимый размер по Y колеблется с поворотом —
        // дешёвая имитация 3D-переворота конфетти
        const flutter = 0.35 + 0.65 * Math.abs(Math.sin(p.rot * 1.7));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, (-p.h / 2) * flutter, p.w, p.h * flutter);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    if (alive === 0) {
      cleanup();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  // страховка: авто-удаление, даже если rAF завис (фон-вкладка)
  failsafe = setTimeout(cleanup, DURATION_MS + 400);
}

export default fireGoldConfetti;

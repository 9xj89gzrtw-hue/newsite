"use client";

import { useEffect, useRef, useState } from "react";
import "./wow.css";

/**
 * GoldDust — «золотая пыль» над видео-секцией gg-video-showcase.
 *
 * Canvas absolute inset-0 внутри relative-контейнера секции: над
 * видео-скримом (позже в DOM), под редакционным текстом (контент z-10).
 * pointer-events:none — не мешает CTA и Play-кнопке.
 *
 * - 40–60 частиц на coarse/узких экранах (<768px), иначе 60–100;
 *   радиус 0.5–2px, золото #C9A227/#E5C76B/#8A6D1F, alpha 0.15–0.4
 *   (с мягким мерцанием в пределах ±15%).
 * - Движение: медленный дрейф вверх + синус-шатание по горизонтали;
 *   лёгкий параллакс от мыши (только fine-pointer, амплитуда ≤6px,
 *   со сглаживанием lerp — сдержанно, не мельтешит).
 * - DPR cap 1.5; rAF-цикл С ПАУЗАМИ: document.hidden → стоп,
 *   IntersectionObserver секции → вне вьюпорта стоп.
 * - prefers-reduced-motion → canvas вообще не рендерится.
 * - resize через ResizeObserver с debounce 150ms, частицы
 *   пересчитываются пропорционально (без визуального «попа»).
 * - SSR-safe: канвас появляется только после mount-эффекта (первый
 *   клиентский рендер совпадает с серверным — null).
 */

/** Кап DPR: ретина-перерисовка не окупается на пыли 0.5–2px. */
const DPR_CAP = 1.5;
/** Пауза rAF за пределами вьюпорта + запас. */
const IO_MARGIN = "50px";

type Dust = {
  /** Базовые координаты в CSS-пикселях канваса. */
  x: number;
  y: number;
  /** Радиус, px (0.5–2). */
  r: number;
  /** Индекс цвета в PALETTE (K4, F3: вместо трёх чисел cr/cg/cb — палитра
   * конечна, индекс адресует прекэшированные fillStyle-строки). */
  ci: number;
  /** Базовая альфа 0.15–0.4. */
  a: number;
  /** Скорость дрейфа вверх, px/кадр. */
  vy: number;
  /** Синус-шатание: амплитуда/фаза/частота. */
  swayAmp: number;
  swayPhase: number;
  swaySpeed: number;
  /** Фаза мерцания альфы. */
  twinkle: number;
  /** Коэффициент параллакса 0.4–1 (глубина пылинки). */
  depth: number;
};

/** Палитра золота: тёплое среднее, светлое, тёмное. */
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [201, 162, 39], // #C9A227
  [229, 199, 107], // #E5C76B
  [138, 109, 31], // #8A6D1F
];

/* K4 (cycle-71, F3): micro-perf. Раньше `rgba(...)` + toFixed(3) собирались
   на каждую частицу на каждый кадр (~4.3k строк/с при 72 частицах — чистый
   мусор для GC). Теперь: строки прекэшированы по (палитра × alpha-ступени),
   в кадре — только числовой lookup FILL_STYLES[ci][step], ноль аллокаций.
   65 ступеней на диапазон [0, ALPHA_MAX=0.5] → шаг ~0.0078: мерцание
   (амплитуда ≤±15% от базовой 0.15–0.4) проходит через ~7 ступеней —
   визуально неотличимо от прежнего toFixed(3). */
const ALPHA_MAX = 0.5; // потолок реальных альф: 0.4 × 1.0 = 0.4 (+запас)
const ALPHA_STEPS = 64;
const FILL_STYLES: string[][] = PALETTE.map(([cr, cg, cb]) => {
  const row: string[] = [];
  for (let i = 0; i <= ALPHA_STEPS; i++) {
    const a = Math.min(ALPHA_MAX, (i / ALPHA_STEPS) * ALPHA_MAX);
    row.push(`rgba(${cr}, ${cg}, ${cb}, ${a.toFixed(3)})`);
  }
  return row;
});

const rand = (min: number, max: number): number => min + Math.random() * (max - min);

const makeDust = (x: number, y: number): Dust => {
  const ci = Math.floor(Math.random() * PALETTE.length);
  return {
    x,
    y,
    r: rand(0.5, 2),
    ci,
    a: rand(0.15, 0.4),
    vy: rand(0.06, 0.2),
    swayAmp: rand(0.5, 2.2),
    swayPhase: rand(0, Math.PI * 2),
    swaySpeed: rand(0.0004, 0.0014),
    twinkle: rand(0, Math.PI * 2),
    depth: rand(0.4, 1),
  };
};

export function GoldDust() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Канвас рендерится только после mount и без reduce-motion:
  // сервер и первый клиентский рендер дают null → гидрация стабильна
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- размер под контейнер (DPR cap) ---
    let w = 0;
    let h = 0;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      w = rect.width;
      h = rect.height;
      if (w <= 0 || h <= 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // --- частицы ---
    const small =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const count = small ? 48 : 72;
    const dust: Dust[] = [];
    for (let i = 0; i < count; i++) {
      dust.push(makeDust(Math.random() * w, Math.random() * h));
    }

    // --- параллакс от указателя (только fine pointer, амплитуда ≤6px) ---
    let px = 0;
    let py = 0;
    let targetX = 0;
    let targetY = 0;
    const AMP = 6;
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const rect = host.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = -nx * AMP; // контр-движение: пыль «глубже» кадра
      targetY = -ny * AMP;
    };
    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer) {
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    // --- rAF-цикл с паузами (вьюпорт + видимость вкладки) ---
    let raf = 0;
    let running = false;
    let inView = false;

    const frame = (t: number) => {
      // сглаживание параллакса — плавно догоняет цель
      px += (targetX - px) * 0.05;
      py += (targetY - py) * 0.05;
      ctx.clearRect(0, 0, w, h);
      for (const p of dust) {
        p.y -= p.vy;
        if (p.y < -4) {
          // уплыла вверх — респавн снизу новым «характером»
          Object.assign(p, makeDust(Math.random() * w, h + 4));
          continue;
        }
        const x =
          p.x + Math.sin(t * p.swaySpeed + p.swayPhase) * p.swayAmp + px * p.depth;
        const y = p.y + py * p.depth;
        // мерцание в пределах 0.85–1.0 от базовой альфы (±15%), затем —
        // квантование в прекэшированную rgba-строку (K4, F3: ноль аллокаций)
        const a = p.a * (0.85 + 0.15 * Math.sin(t * 0.0012 + p.twinkle));
        const step = Math.min(
          ALPHA_STEPS,
          Math.max(0, Math.round((a / ALPHA_MAX) * ALPHA_STEPS)),
        );
        ctx.fillStyle = FILL_STYLES[p.ci][step];
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        if (inView) start();
        else stop();
      },
      { rootMargin: IO_MARGIN },
    );
    io.observe(host);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // --- resize с debounce, частицы масштабируются пропорционально ---
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const oldW = w;
        const oldH = h;
        resize();
        if (oldW > 0 && oldH > 0 && w > 0 && h > 0) {
          const kx = w / oldW;
          const ky = h / oldH;
          for (const p of dust) {
            p.x *= kx;
            p.y *= ky;
          }
        }
      }, 150);
    });
    ro.observe(host);

    // старт: IO сразу стрелянет стартом, если секция уже в вьюпорте
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      if (finePointer) {
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="gold-dust-canvas" aria-hidden="true" />;
}

export default GoldDust;

"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { fireGoldConfetti } from "@/components/motion/gold-confetti";
import "./micro-delights.css";

/**
 * MicroDelights — C78 «скрытые вау-сюрпризы»: микровзаимодействия, которых
 * НЕ видно при первом взгляде — они раскрываются только в контакте.
 *
 * ==========================================================================
 * ЧТО ДЕЛАЕТ (всё — декларативные data-атрибуты на существующих элементах,
 * сама логика — ДОКУМЕНТ-ДЕЛЕГИРОВАНИЕ, ноль слушателей на элемент):
 *
 *   [data-spark]        двойной тап/клик ≤350мс ≤48px → золотой всплеск
 *                       «искр» (8–14 частиц, WAAPI, transform/opacity only,
 *                       авто-удаление ≤950мс). Мышь И палец. Марquee-фото,
 *                       плитки Instagram, портрет основателя.
 *                       reduce-motion → noop.
 *
 *   [data-egg="confetti"] 3 тапа ≤1600мс → fireGoldConfetti(элемент) +
 *                       sonner-тост «секретный ингредиент» (id = анти-стек).
 *                       Логотип в шапке: 3 клика = салют + признание.
 *
 *   [data-tilt]         3D-наклон к курсору (≤5°, perspective 700px) +
 *                       блик-глянец, следующий за указателем (луч 120px,
 *                       opacity-only). fine-pointer И не reduce-motion.
 *                       Плитки карусели видео. Уход — WAAPI-возврат 380мс.
 *
 *   a[data-wiggle]      CSS-only (в micro-delights.css): wiggle-анимация
 *                       0.55s на hover — соцкнопки футера.
 *
 * ==========================================================================
 * PERF (§43, числа — по построению, проверено dev.log/agent-browser):
 *   - 2 пассивных document-слушателя (pointerdown + pointerover) ПОСТОЯННО;
 *     pointermove — ТОЛЬКО пока активен tilt (guard-выход первым кадром);
 *     ноль rAF-циклов в покое.
 *   - getBoundingClientRect: ≤1/кадр и только во время tilt (паттерн
 *     CustomCursor); на spark/egg — ≤1 на событие.
 *   - Частицы: ≤14 DOM-узлов, WAAPI transform/opacity (композитор),
 *     авто-удаление; canvas конфетти — утилита gold-confetti (DPR-cap 1.5).
 *   - Делегирование: annotated-элементов может быть сколь угодно много —
 *     слушателей от этого НЕ прибавляется.
 *
 * A11Y:
 *   - Всё декоративное — pointer-events:none, aria-hidden.
 *   - prefers-reduced-motion: spark/tilt/wiggle → noop (CSS-гейт отдельно),
 *     тост — информативный UI, остаётся; конфетти сам-noop.
 *   - touch-action: manipulation на [data-spark] (в CSS) — убирает
 *     iOS double-tap-zoom, тапы остаются честными.
 */

/** Двойной тап: окно времени и радиус (px) между тапами. */
const SPARK_WINDOW_MS = 350;
const SPARK_RADIUS_PX = 48;
/** Яйцо: число тапов и окно. */
const EGG_TAPS = 3;
const EGG_WINDOW_MS = 1600;
/** Максимальный наклон tilt, градусы. */
const TILT_MAX_DEG = 5;

export function MicroDelights() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* Гейт fine-эффектов: НЕ-coarse, а не «fine» — headless-автоматизация
     * рапортует (pointer: none) (грабли §-цикла 43, worklog 2093):
     * инверсия даёт паритет мыши/клавиатуры/автотестам. Тач → coarse →
     * скип. */
    const coarseMq = window.matchMedia("(pointer: coarse)");

    /* ── spark: двойной тап → всплеск искр ─────────────────────────── */
    let lastTap = { x: -999, y: -999, t: -Infinity };

    const sparkBurst = (x: number, y: number) => {
      if (reduceMq.matches) return;
      const holder = document.createElement("div");
      holder.className = "micro-spark-holder";
      holder.setAttribute("aria-hidden", "true");
      holder.style.left = `${x}px`;
      holder.style.top = `${y}px`;

      const count = window.innerWidth < 768 ? 9 : 13;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = i % 3 === 2 ? "micro-spark micro-spark--dot" : "micro-spark";
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.7;
        const dist = 24 + Math.random() * 46;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - 14; // лёгкий восходящий бейс
        const scale = 0.55 + Math.random() * 0.75;
        const dur = 460 + Math.random() * 280;
        s.animate(
          [
            {
              transform: "translate(-50%, -50%) translate(0px, 0px) scale(0) rotate(0deg)",
              opacity: 1,
            },
            {
              transform: `translate(-50%, -50%) translate(${dx * 0.42}px, ${
                dy * 0.42 - 6
              }px) scale(${scale}) rotate(75deg)`,
              opacity: 1,
              offset: 0.45,
            },
            {
              transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${
                scale * 0.35
              }) rotate(170deg)`,
              opacity: 0,
            },
          ],
          { duration: dur, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" },
        );
        holder.appendChild(s);
      }
      document.body.appendChild(holder);
      window.setTimeout(() => holder.remove(), 950);
    };

    /* ── egg: счётчик тапов на элемент (WeakMap — не течёт) ────────── */
    const eggState = new WeakMap<HTMLElement, { n: number; t: number }>();

    const eggTap = (el: HTMLElement) => {
      const now = performance.now();
      const prev = eggState.get(el);
      const next =
        prev && now - prev.t <= EGG_WINDOW_MS
          ? { n: prev.n + 1, t: now }
          : { n: 1, t: now };
      eggState.set(el, next);
      if (next.n >= EGG_TAPS) {
        eggState.set(el, { n: 0, t: 0 });
        fireGoldConfetti(el);
        toast("Секретный ингредиент — любовь. С 2007 года.", {
          duration: 2600,
          id: "micro-egg", // повторные яйца обновляют один тост, не стек
        });
      }
    };

    /* ── tilt: 3D-наклон + глянец (fine pointer, не reduce) ────────── */
    let tiltEl: HTMLElement | null = null;
    let glare: HTMLElement | null = null;
    let tiltRaf = 0;

    const writeTilt = (cx: number, cy: number) => {
      if (!tiltEl) return;
      // ≤1 rect/кадр (rAF-батч ниже) — паттерн CustomCursor §43.
      const r = tiltEl.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const rx = Math.max(-0.5, Math.min(0.5, (cx - r.left) / r.width - 0.5));
      const ry = Math.max(-0.5, Math.min(0.5, (cy - r.top) / r.height - 0.5));
      tiltEl.style.transform = `perspective(700px) rotateX(${(
        -ry * 2 * TILT_MAX_DEG
      ).toFixed(2)}deg) rotateY(${(rx * 2 * TILT_MAX_DEG).toFixed(2)}deg)`;
      if (glare) {
        glare.style.setProperty("--gx", `${((rx + 0.5) * 100).toFixed(1)}%`);
        glare.style.setProperty("--gy", `${((ry + 0.5) * 100).toFixed(1)}%`);
      }
    };

    const onTiltMove = (e: PointerEvent) => {
      if (!tiltEl || tiltRaf) return;
      tiltRaf = requestAnimationFrame(() => {
        tiltRaf = 0;
        writeTilt(e.clientX, e.clientY);
      });
    };

    const startTilt = (el: HTMLElement) => {
      tiltEl = el;
      el.classList.add("micro-tilt--on");
      glare = document.createElement("span");
      glare.className = "micro-glare";
      glare.setAttribute("aria-hidden", "true");
      el.appendChild(glare);
      document.addEventListener("pointermove", onTiltMove, { passive: true });
    };

    const endTilt = () => {
      if (!tiltEl) return;
      const el = tiltEl;
      const g = glare;
      tiltEl = null;
      glare = null;
      document.removeEventListener("pointermove", onTiltMove);
      if (tiltRaf) {
        cancelAnimationFrame(tiltRaf);
        tiltRaf = 0;
      }
      const finish = () => {
        el.style.transform = "";
        el.classList.remove("micro-tilt--on");
        g?.remove();
      };
      if (reduceMq.matches || !el.style.transform) {
        finish();
        return;
      }
      // WAAPI-возврат в ноль (transform-only, комппозитор); после — сброс.
      const back = el.animate(
        [
          { transform: el.style.transform },
          { transform: "perspective(700px) rotateX(0deg) rotateY(0deg)" },
        ],
        { duration: 380, easing: "cubic-bezier(.22, 1, .36, 1)" },
      );
      back.onfinish = finish;
      back.oncancel = finish;
      // страховка: анимации WAAPI в фоновой вкладке стоят — чистим таймером
      window.setTimeout(() => {
        if (back.playState !== "finished") back.cancel();
      }, 620);
    };

    /* ── делегирование: один pointerdown + один pointerover ────────── */
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;

      const eggEl = target.closest<HTMLElement>("[data-egg]");
      if (eggEl) eggTap(eggEl);

      const sparkEl = target.closest<HTMLElement>("[data-spark]");
      if (sparkEl) {
        const now = performance.now();
        const near =
          now - lastTap.t <= SPARK_WINDOW_MS &&
          Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) <= SPARK_RADIUS_PX;
        lastTap = { x: e.clientX, y: e.clientY, t: now };
        if (near) sparkBurst(e.clientX, e.clientY);
      }
    };

    const onPointerOver = (e: PointerEvent) => {
      if (coarseMq.matches || reduceMq.matches) return;
      if (e.pointerType === "touch") return;
      const target = e.target as Element | null;
      const el = target?.closest?.("[data-tilt]") as HTMLElement | null;
      if (el === tiltEl) return;
      endTilt();
      if (el) startTilt(el);
    };

    const onPointerOut = (e: PointerEvent) => {
      if (!tiltEl) return;
      const to = e.relatedTarget as Node | null;
      if (to && tiltEl.contains(to)) return;
      endTilt();
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      endTilt();
    };
  }, []);

  return null;
}

export default MicroDelights;

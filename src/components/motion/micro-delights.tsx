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
 *                       (c83-F1: a[data-wiggle] — удалён: соцкнопки
 *                       футера перешли на y-hop в site-footer-anim.css,
 *                       CSS осиротел — см. micro-delights.css.)
 *
 * C79 «Mobile Motion» — touch-эквиваленты всего hover-выше (задача
 * владельца: «в мобильной версии очень мало анимации»):
 *
 *   [data-press] и      touch-pointerdown → WAAPI-нажатие scale(0.94)
 *   [data-spark]        за 150мс (fill forwards); pointerup → пружина
 *                       0.94→1.03→1 (340мс, без fill — возврат к нативу).
 *                       Скольжение пальца >12px (скролл/драг марке) —
 *                       мгновенная отмена (возврат 200мс). Анимируется
 *                       ИНДИВИДУАЛЬНОЕ свойство `scale`, НЕ transform
 *                       (81-F1: transform-кейфреймы — даже composite:'add'
 *                       — конфликтуют с позиционирующим translate кнопок,
 *                       критик B CRITICAL; см. animateScale ниже).
 *   [data-spark]+
 *   лонг-пресс 430мс    «золотой выдох»: усиленный всплеск искр ×1.6 +
 *                       расширяющееся кольцо 56px + пульс фото
 *                       scale 1→1.045→1 + navigator.vibrate(12) (Android).
 *                       Клик ПОСЛЕ выдоха гасится (capture, once, 600мс
 *                       страховка) — палец ушёл с ссылки без перехода.
 *
 * ==========================================================================
 * PERF (§43, числа — по построению, проверено dev.log/agent-browser):
 *   - 3 пассивных document-слушателя (pointerdown + pointerover +
 *     pointerout) ПОСТОЯННО; pointermove/pointerup/pointercancel — ТОЛЬКО
 *     пока активен tilt ИЛИ нажатие (снимаются первым же освобождением);
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
 *   - prefers-reduced-motion: spark/tilt → noop (CSS-гейт отдельно),
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

/* ══ C79: touch-нажатие / лонг-пресс ═══════════════════════════════════ */
/** Нажатие: время прижатия и масштаб. */
const PRESS_DOWN_MS = 150;
const PRESS_SCALE = 0.94;
/** Освобождение: пружина возврата с лёгким overshoot. */
const PRESS_UP_MS = 340;
/** Отмена (скролл/драг): быстрый возврат. */
const PRESS_CANCEL_MS = 200;
/** Лонг-пресс: порог удержания и радиус срыва пальцем. */
const HOLD_MS = 430;
const HOLD_MOVE_PX = 12;
/** Усиление искр лонг-пресса (×1.6 — частицы/радиус/длительность). */
const HOLD_SPARK_BOOST = 1.6;

/** 81-F1 (критик B, CRITICAL): все press/возврат/пульс-анимации — кейфреймы
 *  через ИНДИВИДУАЛЬНОЕ CSS-свойство `scale`, НЕ через `transform`.
 *  Причина: WAAPI-слой с transform-кейфреймами (даже с composite:'add' —
 *  см. 81-F1b ниже) конфликтует с позиционирующим translate(-50%,-50%)
 *  кнопок (.ea-evt-video__play в карусели): replace-кейфреймы сносили
 *  transform на ~80px и тап уходил мимо модалки (критик B CRITICAL).
 *  Свойство `scale` не трогает transform ВООБЩЕ — ноль интеракции с
 *  CSS-transition на transform у тех же кнопок.
 *  81-F1b ЗАМЕРЫ (390×844, playwright, research/f81-f1b/): scale-ветка
 *  держит кнопку под пальцем (клик доходит, модалка открывается ✓);
 *  центро-сдвиг S·T-композиции у кнопок с translate-центрированием
 *  ≈3.75px лечится НЕ здесь, а transform-origin на самой кнопке
 *  (events-video-carousel.css: origin 0 0 = визуальный центр —
 *  т.к. translate(-50%,-50%) приводит центр бокса в его же левый-верхний
 *  угол; с таким origin ЛЮБАЯ scale-композиция центро-инвариантна).
 *  Побочный замер 81-F1b: transform+composite:'add' в Chromium 1234
 *  при одновременном CSS-transition на transform (hover 0.1s) ТЕРЯЕТ
 *  translate в computed matrix на ~340мс пружины → кнопка телепортируется
 *  на +75px и клик после тапа уходит в video — РЕГРЕССИЯ критика B.
 *  Поэтому composite-ветка — только фоллбек для старых WebKit без
 *  индивидуальных свойств (Safari <14.1), где нет и нашего transition-
 *  бага (движок другой).
 *  Фиче-детект: старый WebKit молча выкидывает незнакомое свойство из
 *  кейфреймов — ловим по getKeyframes(); для composite-фоллбека
 *  дополнительно проверяем effect.composite === 'add' (браузер без
 *  поддержки молча сводит к 'replace' = тот самый ~80px-снос). */
const animateScale = (
  el: HTMLElement,
  frames: Array<{ scale: number; offset?: number }>,
  options: KeyframeAnimationOptions,
): Animation | null => {
  if (typeof el.animate !== "function") return null;
  /* Первичная ветка: индивидуальное CSS-свойство `scale` — не трогает
     transform, ноль конфликтов с CSS-transition на transform. */
  const scaleFrames: Keyframe[] = frames.map((f) =>
    f.offset === undefined ? { scale: f.scale } : { scale: f.scale, offset: f.offset },
  );
  try {
    const anim = el.animate(scaleFrames, options);
    const effect = anim.effect as KeyframeEffect | null;
    const survived = (effect?.getKeyframes?.() ?? []).some(
      (k) => k.scale !== undefined,
    );
    if (survived) return anim;
    anim.cancel();
  } catch {
    /* TypeError — невалидные кейфреймы для старого Safari: фоллбек. */
  }
  /* Фоллбек (старый WebKit без индивидуальных свойств): аддитивный
     transform. Фиче-детект effect.composite обязателен: браузер без
     composite молча сводит к 'replace' — это ~80px-снос критика B. */
  const transformFrames: Keyframe[] = frames.map((f) => {
    const frame: Keyframe = { transform: `scale(${f.scale})` };
    if (f.offset !== undefined) frame.offset = f.offset;
    return frame;
  });
  try {
    const anim = el.animate(transformFrames, { ...options, composite: "add" });
    const effect = anim.effect as KeyframeEffect | null;
    const additive = effect?.composite === "add";
    const survived = (effect?.getKeyframes?.() ?? []).some(
      (k) => k.transform !== undefined,
    );
    if (additive && survived) return anim;
    anim.cancel();
  } catch {
    /* Оба механизма мертвы (очень старый WebKit) — без нажатия. */
  }
  return null;
};

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

    const sparkBurst = (x: number, y: number, boost = 1) => {
      if (reduceMq.matches) return;
      const holder = document.createElement("div");
      holder.className = "micro-spark-holder";
      holder.setAttribute("aria-hidden", "true");
      holder.style.left = `${x}px`;
      holder.style.top = `${y}px`;

      const count = Math.round((window.innerWidth < 768 ? 9 : 13) * boost);
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = i % 3 === 2 ? "micro-spark micro-spark--dot" : "micro-spark";
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.7;
        const dist = (24 + Math.random() * 46) * boost;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - 14 * boost; // лёгкий восходящий бейс
        const scale = 0.55 + Math.random() * 0.75;
        const dur = (460 + Math.random() * 280) * Math.min(boost, 1.25);
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
      window.setTimeout(() => holder.remove(), 950 * Math.min(boost, 1.25));
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

    /* ── C79: touch-нажатие + лонг-пресс ─────────────────────────────────
     * Слушатели pointermove/up/cancel живут ТОЛЬКО пока палец прижат
     * (паттерн tilt: снятие первым же освобождением). В покое — их нет.
     * pressAnim без fill на возврате: после завершения элемент возвращается
     * к нативному inline/каскадному transform — WAAPI-слой исчезает сам. */
    let pressEl: HTMLElement | null = null;
    let pressAnim: Animation | null = null;
    let pressStartX = 0;
    let pressStartY = 0;
    let holdTimer = 0;
    let holdFired = false;

    const detachPressListeners = () => {
      document.removeEventListener("pointermove", onPressMove);
      document.removeEventListener("pointerup", onPressUp);
      document.removeEventListener("pointercancel", onPressCancel);
    };

    const stopHoldTimer = () => {
      if (holdTimer) {
        window.clearTimeout(holdTimer);
        holdTimer = 0;
      }
    };

    /** Клик после выдоха: палец держали 430мс+ и отпустили на ссылке —
     * переход был бы случайным. Гасим capture-фазой (once) + страховка
     * 600мс на случай, когда клика вовсе не последовало. */
    const suppressClickAfterHold = (el: HTMLElement) => {
      const onClick = (ev: MouseEvent) => {
        const t = ev.target as Node | null;
        if (t && (t === el || el.contains(t))) {
          ev.preventDefault();
          ev.stopPropagation();
        }
      };
      document.addEventListener("click", onClick, { capture: true, once: true });
      window.setTimeout(
        () => document.removeEventListener("click", onClick, { capture: true }),
        600,
      );
    };

    /** Лонг-пресс по [data-spark] — «золотой выдох». */
    const fireHoldBurst = (el: HTMLElement, x: number, y: number) => {
      sparkBurst(x, y, HOLD_SPARK_BOOST);
      const ring = document.createElement("div");
      ring.className = "micro-press-ring";
      ring.setAttribute("aria-hidden", "true");
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      ring.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.35)", opacity: 0.95 },
          { transform: "translate(-50%, -50%) scale(2.3)", opacity: 0 },
        ],
        { duration: 640, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
      );
      document.body.appendChild(ring);
      window.setTimeout(() => ring.remove(), 700);
      // Пульс самого фото — свойство `scale` (не transform): даже если у
      // [data-spark]-элемента окажется позиционирующий CSS-transform,
      // WAAPI его не снесёт (81-F1, см. animateScale).
      animateScale(el, [{ scale: 1 }, { scale: 1.045, offset: 0.4 }, { scale: 1 }], {
        duration: 620,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
      // Тактильный отклик — только Android (iOS Safari API не имеет).
      try {
        navigator.vibrate?.(12);
      } catch {
        /* noop */
      }
    };

    const onPressMove = (e: PointerEvent) => {
      if (!pressEl) return;
      if (
        Math.hypot(e.clientX - pressStartX, e.clientY - pressStartY) > HOLD_MOVE_PX
      ) {
        cancelPress();
      }
    };

    const onPressUp = () => {
      stopHoldTimer();
      detachPressListeners();
      if (!pressEl) return;
      const el = pressEl;
      pressEl = null;
      pressAnim?.cancel();
      // Пружина возврата 0.94→1.032→1 — свойство `scale`, позиционирующий
      // CSS-transform кнопки не трогаем (81-F1, критик B CRITICAL).
      pressAnim = animateScale(
        el,
        [
          { scale: PRESS_SCALE },
          { scale: 1.032, offset: 0.55 },
          { scale: 1 },
        ],
        { duration: PRESS_UP_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      if (holdFired) {
        holdFired = false;
        suppressClickAfterHold(el);
      }
    };

    const onPressCancel = () => cancelPress();

    function cancelPress() {
      stopHoldTimer();
      detachPressListeners();
      holdFired = false;
      if (!pressEl) return;
      const el = pressEl;
      pressEl = null;
      pressAnim?.cancel();
      // Срыв (скролл/драг) — быстрый честный возврат без overshoot.
      pressAnim = animateScale(
        el,
        [{ scale: PRESS_SCALE }, { scale: 1 }],
        { duration: PRESS_CANCEL_MS, easing: "ease-out" },
      );
    }

    const startHold = (el: HTMLElement, x: number, y: number) => {
      holdFired = false;
      holdTimer = window.setTimeout(() => {
        holdTimer = 0;
        holdFired = true;
        fireHoldBurst(el, x, y);
      }, HOLD_MS);
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

      /* C79: touch-нажатие — [data-press] (кнопки/ссылки) и [data-spark]
       * (фото: нажатие + кандидат на лонг-пресс-выдох). */
      if (e.pointerType === "touch" && !reduceMq.matches) {
        const pressTarget = target.closest<HTMLElement>("[data-press], [data-spark]");
        if (pressTarget) {
          pressEl = pressTarget;
          pressStartX = e.clientX;
          pressStartY = e.clientY;
          pressAnim?.cancel();
          // Нажатие scale(1)→0.94 за 150мс (fill forwards — держится до
          // pointerup). Свойство `scale` — НЕ transform: кнопка с
          // translate(-50%,-50%) остаётся на месте (81-F1, критик B).
          pressAnim = animateScale(
            pressTarget,
            [{ scale: 1 }, { scale: PRESS_SCALE }],
            {
              duration: PRESS_DOWN_MS,
              easing: "cubic-bezier(0.3, 0.9, 0.4, 1)",
              fill: "forwards",
            },
          );
          if (pressTarget.hasAttribute("data-spark")) {
            startHold(pressTarget, e.clientX, e.clientY);
          }
          document.addEventListener("pointermove", onPressMove, { passive: true });
          document.addEventListener("pointerup", onPressUp, { passive: true });
          document.addEventListener("pointercancel", onPressCancel, { passive: true });
        }
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
      stopHoldTimer();
      detachPressListeners();
      pressAnim?.cancel();
      endTilt();
    };
  }, []);

  return null;
}

export default MicroDelights;

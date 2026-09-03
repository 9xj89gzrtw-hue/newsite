"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * CustomCursor — «Liquid Lens», Cycle-73 ПОЛНЫЙ редизайн (сентябрь 2026).
 *
 * Жалоба владельца: «курсор когда водишь опережает кружок» — в старом
 * дизайне кольцо висело на пружине (stiffness 250 / damping 25) и
 * отставало от точки-указателя на ~150-250мс. Лечится не тюнингом
 * пружины, а сменой архитектуры: ПОЗИЦИЯ НИКОГДА не анимируется.
 *
 * Паттерн 2026 («liquid lens» — эволюция dot+ring):
 *   1. ПОЗИЦИЯ: единственный трекинг-слой (wrapper) получает
 *      translate3d ПРЯМОМ записью в обработчике pointermove — без rAF,
 *      без спринга, без React. Курсор физически не может отстать:
 *      он рисуется в том же кадре, что и системный указатель.
 *   2. ФОРМА: скорость указателя деформирует линзу в «каплю» —
 *      растяжение вдоль вектора движения (до +32%) и сжатие поперёк
 *      (до −22%), возврат к кругу — самозавершающийся rAF-цикл
 *      (работает ТОЛЬКО пока есть деформация, иначе не существует).
 *   3. СТЕКЛО: backdrop-filter (blur + saturate + brightness) — линза
 *      реально преломляет контент под собой: hero-видео и фото
 *      «плывут» сквозь курсор. На плоских крем-секциях эффект
 *      нейтрален, золото-рамка несёт читаемость.
 *   4. ХОВЕР: морф масштаба линзы (пружина ТОЛЬКО на размер,
 *      40→60px) + лейбл data-cursor внутри.
 *   5. МАГНИТ: весь курсор гравитирует к центру CTA (22% тяги,
 *      кап ±24px) — смещение лерпится в rAF-цикле, позиция при этом
 *      остаётся честной (магнит = намеренное притяжение, не лаг).
 *   6. ПРЕСС: mousedown сжимает линзу до 0.82 — тактильный отклик.
 *   7. ПРЕВЬЮ: data-cursor-image морфит курсор в фото-карточку 120px
 *      (позиция карточки = мгновенная, как у линзы).
 *
 * Удержанные API сайта (ноль правок в компонентах-потребителях):
 * data-cursor (лейбл), data-cursor-image (превью), data-magnetic.
 *
 * Perf (RULES §5): анимируются только transform/opacity (композитор);
 * getBoundingClientRect читается ≤1 раза/кадр и ТОЛЬКО пока активен
 * магнит; getAttribute ×2 на событие (без layout); React-стейт
 * переключается только при смене ИДЕНТИЧНОСТИ hovered-элемента
 * (перечитывание data-cursor* каждый ход — W3-FIX stale-preview);
 * слушатели passive; rAF-цикл самозавершается при покое.
 *
 * Юзабилити 2026: над текстовыми полями (input/textarea/select)
 * курсор прячется и возвращается системный I-beam (globals.css),
 * у края окна линза растворяется (не замирает на границе).
 *
 * Гейты: (pointer: fine) AND (min-width: 768px) — класс
 * `catering-cursor` на body в синхроне с media query. Мобайл/коарс:
 * системный курсор, компонент не активен. prefers-reduced-motion:
 * без деформации/магнита/риппла, мгновенные смены состояний —
 * НО позиция всё равно прямая (курсор обязан быть в точке указателя).
 */

/* ── геометрия ─────────────────────────────────────────────────────── */
const LENS_SIZE_PX = 40;
/** Ховер: линза 40 → 60px (scale, никогда width). */
const LENS_HOVER_SCALE = 1.5;
/** Пресс: тактильное сжатие на mousedown. */
const LENS_PRESS_SCALE = 0.82;
const DOT_SIZE_PX = 5;
const PREVIEW_SIZE_PX = 120;

/* ── «капля»: деформация по скорости указателя ─────────────────────── */
/** Расстояние за 1 событие, дающее полную деформацию (нормализация). */
const V_NORM_PX = 26;
/** Растяжение вдоль вектора движения, максимум. */
const STRETCH_MAX = 0.32;
/** Сжатие поперёк, максимум. */
const SQUASH_MAX = 0.22;

/* ── магнит ────────────────────────────────────────────────────────── */
/** Тяга к центру CTA (весь курсор, не догоняющее кольцо). */
const MAGNET_STRENGTH = 0.22;
/** ...но не дальше 24px — точность указателя важнее гравитации. */
const MAGNET_MAX_PX = 24;

const INTERACTIVE_SELECTOR =
  "a,button,[data-cursor],input,select,textarea,label,[role=button]";
const MAGNET_SELECTOR = "a,button,[data-magnetic]";
/** Зоны, где системный курсор честнее кастомного (I-beam). */
const NATIVE_ZONE_SELECTOR =
  'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]),textarea,select';

type Ripple = { id: number; x: number; y: number };

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [seen, setSeen] = useState(false);
  const [edgeOut, setEdgeOut] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [nativeZone, setNativeZone] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const prefersReducedMotion = useReducedMotion();

  /* ── DOM-хендлы (прямые записи, React их не касается) ────────────── */
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const deformRef = useRef<HTMLDivElement | null>(null);

  /* ── динамика (refs — мутации вне рендера) ───────────────────────── */
  const lastXRef = useRef(-100);
  const lastYRef = useRef(-100);
  const sxRef = useRef(1);
  const syRef = useRef(1);
  const angRef = useRef(0);
  const tvRef = useRef(0);
  const magXRef = useRef(0);
  const magYRef = useRef(0);
  const magTXRef = useRef(0);
  const magTYRef = useRef(0);
  const dynRafRef = useRef(0);

  const hoverElRef = useRef<HTMLElement | null>(null);
  const magnetElRef = useRef<HTMLElement | null>(null);
  const labelRef = useRef("");
  const previewRef = useRef("");
  const seenRef = useRef(false);
  const edgeOutRef = useRef(false);
  const rippleIdRef = useRef(0);

  /* ── запись позиции: ПРЯМАЯ, в обработчике события ─────────────────
   * Тот самый фикс жалобы: transform — свойство композитора, писать его
   * синхронно в pointermove безопасно (нет layout/paint) и даёт
   * минимально возможную задержку: кадр-в-кадр с системным указателем.
   * rAF-батчинг здесь добавил бы до 16мс лага — поэтому его нет. */
  const writePos = (x: number, y: number) => {
    const w = wrapperRef.current;
    if (w) w.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const writeDeform = () => {
    const d = deformRef.current;
    if (d) d.style.transform = `rotate(${angRef.current}deg) scale(${sxRef.current}, ${syRef.current})`;
  };

  /* ── гейт: fine pointer + md, класс body в синхроне ──────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const apply = () => {
      setEnabled(mq.matches);
      document.body.classList.toggle("catering-cursor", mq.matches);
    };
    apply();
    const onChange = () => apply();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else if (typeof (mq as MediaQueryList).addListener === "function") {
      (mq as MediaQueryList).addListener(onChange);
    }
    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", onChange);
      } else if (typeof (mq as MediaQueryList).removeListener === "function") {
        (mq as MediaQueryList).removeListener(onChange);
      }
      document.body.classList.remove("catering-cursor");
    };
  }, []);

  /* ── движок: pointermove → прямые записи; rAF-цикл → затухание ───── */
  useEffect(() => {
    if (!enabled) return;

    /* rAF-цикл динамики: затухание «капли» + лерп магнита. Живёт только
     * пока есть незатухшая деформация или активный/недообнулённый магнит,
     * в покое не существует (ноль постоянных кадров). */
    const dynamics = () => {
      dynRafRef.current = 0;

      /* Капля: скорость затухает *0.78/кадр, форма лерпится к кругу. */
      tvRef.current *= 0.78;
      const targetSx = 1 + STRETCH_MAX * tvRef.current;
      const targetSy = 1 - SQUASH_MAX * tvRef.current;
      sxRef.current += (targetSx - sxRef.current) * 0.35;
      syRef.current += (targetSy - syRef.current) * 0.35;

      /* Магнит: 1 rect-чит/кадр и только пока цель жива. */
      let magnetLive = false;
      const magnetEl = magnetElRef.current;
      if (magnetEl && !prefersReducedMotion) {
        const r = magnetEl.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          const rawX = (r.left + r.width / 2 - lastXRef.current) * MAGNET_STRENGTH;
          const rawY = (r.top + r.height / 2 - lastYRef.current) * MAGNET_STRENGTH;
          magTXRef.current = Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, rawX));
          magTYRef.current = Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, rawY));
        }
        magnetLive = true;
      } else {
        magTXRef.current = 0;
        magTYRef.current = 0;
      }
      const dmx = magTXRef.current - magXRef.current;
      const dmy = magTYRef.current - magYRef.current;
      if (Math.abs(dmx) > 0.02 || Math.abs(dmy) > 0.02) {
        magXRef.current += dmx * 0.25;
        magYRef.current += dmy * 0.25;
        magnetLive = true;
      }
      /* Перезапись позиции только пока магнит тянет (в покое событие
       * уже записало актуальную позицию — цикл её не трогает). */
      if (magnetLive && Math.abs(magXRef.current) + Math.abs(magYRef.current) > 0.05) {
        writePos(lastXRef.current + magXRef.current, lastYRef.current + magYRef.current);
      }

      writeDeform();

      const unsettled =
        tvRef.current > 0.01 ||
        Math.abs(sxRef.current - 1) > 0.004 ||
        Math.abs(syRef.current - 1) > 0.004 ||
        magnetLive ||
        Math.abs(magXRef.current) > 0.05 ||
        Math.abs(magYRef.current) > 0.05;
      if (unsettled) dynRafRef.current = requestAnimationFrame(dynamics);
    };

    const ensureDynamics = () => {
      if (!dynRafRef.current) dynRafRef.current = requestAnimationFrame(dynamics);
    };

    const onMove = (e: MouseEvent) => {
      const px = e.clientX;
      const py = e.clientY;
      const dx = px - lastXRef.current;
      const dy = py - lastYRef.current;
      const dist = Math.hypot(dx, dy);
      lastXRef.current = px;
      lastYRef.current = py;

      if (!seenRef.current) {
        seenRef.current = true;
        setSeen(true);
      }
      if (edgeOutRef.current) {
        edgeOutRef.current = false;
        setEdgeOut(false);
      }

      /* 1. ПОЗИЦИЯ — мгновенно, тот же кадр. Лаг невозможен. */
      writePos(px + magXRef.current, py + magYRef.current);

      /* 2. КАПЛЯ — цель деформации по вектору скорости. */
      if (!prefersReducedMotion && dist > 0.5) {
        tvRef.current = Math.min(1, dist / V_NORM_PX);
        const targetAng = (Math.atan2(dy, dx) * 180) / Math.PI;
        /* кратчайший поворот (без витков через ±180°) */
        const delta =
          ((((targetAng - angRef.current + 540) % 360) + 360) % 360) - 180;
        angRef.current += delta * 0.55;
        sxRef.current += (1 + STRETCH_MAX * tvRef.current - sxRef.current) * 0.45;
        syRef.current += (1 - SQUASH_MAX * tvRef.current - syRef.current) * 0.45;
        writeDeform();
      }

      /* 3. СОСТОЯНИЯ — identity-gated: closest + 2 getAttribute,
       * без layout-читов; setState только при реальном изменении. */
      const t = e.target as HTMLElement | null;
      const interactive =
        t && typeof t.closest === "function"
          ? (t.closest(INTERACTIVE_SELECTOR) as HTMLElement | null)
          : null;
      if (interactive !== hoverElRef.current) {
        hoverElRef.current = interactive;
        setHovering(Boolean(interactive));
        setNativeZone(
          Boolean(
            interactive &&
              typeof interactive.matches === "function" &&
              interactive.matches(NATIVE_ZONE_SELECTOR),
          ),
        );
        magnetElRef.current =
          interactive &&
          typeof interactive.matches === "function" &&
          interactive.matches(MAGNET_SELECTOR)
            ? interactive
            : null;
      }
      /* W3-FIX (stale-preview): атрибуты перечитываются КАЖДЫЙ ход —
       * hacc-menu сбрасывает data-cursor-image при открытии панели,
       * кэш оставил бы висеть 120px-фото над открытой панелью. */
      const nextLabel =
        (interactive && interactive.getAttribute("data-cursor")) || "";
      if (nextLabel !== labelRef.current) {
        labelRef.current = nextLabel;
        setLabel(nextLabel);
      }
      const nextPreview =
        (interactive && interactive.getAttribute("data-cursor-image")) || "";
      if (nextPreview !== previewRef.current) {
        previewRef.current = nextPreview;
        setPreviewImage(nextPreview);
      }

      /* 4. rAF-цикл: затухание капли / магнит (в покое самозавершится). */
      ensureDynamics();
    };

    /* Пресс: сжатие линзы на нажатие + один риппл-кадр. */
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setPressed(true);
      if (prefersReducedMotion) return;
      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    };
    const onUp = () => setPressed(false);

    /* Край окна: линза растворяется, не замирает на границе. */
    const onLeaveDoc = () => {
      edgeOutRef.current = true;
      setEdgeOut(true);
    };
    const onEnterDoc = () => {
      edgeOutRef.current = false;
      setEdgeOut(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    const root = document.documentElement;
    root.addEventListener("mouseleave", onLeaveDoc);
    root.addEventListener("mouseenter", onEnterDoc);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      root.removeEventListener("mouseleave", onLeaveDoc);
      root.removeEventListener("mouseenter", onEnterDoc);
      if (dynRafRef.current) cancelAnimationFrame(dynRafRef.current);
      dynRafRef.current = 0;
    };
  }, [enabled, prefersReducedMotion]);

  const removeRipple = (id: number) =>
    setRipples((prev) => prev.filter((r) => r.id !== id));

  if (!enabled) return null;

  const instant = Boolean(prefersReducedMotion);
  const hasPreview = Boolean(previewImage);
  /* Линза уступает место превью-карточке / системному I-beam. */
  const lensHidden = hasPreview || nativeZone;
  /* Линза: масштаб — морф ховера/пресса; позиция уже мгновенная. */
  const lensScale = lensHidden
    ? 0
    : pressed
      ? LENS_PRESS_SCALE
      : hovering
        ? LENS_HOVER_SCALE
        : 1;
  const showLabel = hovering && Boolean(label) && !lensHidden;
  const wrapperOpacity = !seen || edgeOut ? 0 : 1;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      aria-hidden="true"
    >
      {/* Трекинг-точка: ЕДИНСТВЕННЫЙ слой позиции. transform пишется
          напрямую из pointermove (см. writePos) — React управляет
          только opacity (появление/край окна), свойство transform
          фреймворку не принадлежит. */}
      <div
        ref={wrapperRef}
        className="fixed top-0 left-0 size-0 will-change-transform"
        style={{ opacity: wrapperOpacity, transition: "opacity 0.25s" }}
      >
        {/* Деформация «капля»: rotate+scale по вектору скорости —
            прямой записью (writeDeform), React не трогает. */}
        <div ref={deformRef} className="absolute top-0 left-0 size-0 will-change-transform">
          {/* Морф масштаба (ховер/пресс/превью) — пружина ТОЛЬКО на
              размер: motion.scale пишет transform этого слоя, конфликтов
              с ручными записями нет (позиция/деформация — на других). */}
          <motion.div
            className="absolute top-0 left-0 size-0"
            initial={{ scale: 0 }}
            animate={{ scale: lensScale }}
            transition={
              instant
                ? { duration: 0 }
                : { type: "spring", stiffness: 380, damping: 26 }
            }
          >
            {/* ВИЗУАЛ: стеклянная линза. backdrop-filter преломляет
                контент под курсором (hero-видео/фото); золото-рамка и
                микро-точка несут читаемость на плоских секциях. */}
            <div
              className="absolute top-0 left-0 flex items-center justify-center rounded-full"
              style={{
                width: LENS_SIZE_PX,
                height: LENS_SIZE_PX,
                marginLeft: -LENS_SIZE_PX / 2,
                marginTop: -LENS_SIZE_PX / 2,
                border: "1.5px solid var(--gold)",
                background: "rgba(212, 163, 115, 0.10)",
                backdropFilter: "blur(2.5px) saturate(1.3) brightness(1.05)",
                WebkitBackdropFilter: "blur(2.5px) saturate(1.3) brightness(1.05)",
                boxShadow: "0 4px 16px rgba(212, 163, 115, 0.25)",
              }}
            >
              {/* Центральная микро-точка — якорь точности; на ховере
                  уступает место лейблу. */}
              <motion.span
                className="rounded-full bg-gold"
                style={{
                  width: DOT_SIZE_PX,
                  height: DOT_SIZE_PX,
                  filter: "drop-shadow(0 1px 3px rgba(26, 27, 26, 0.5))",
                }}
                animate={{ opacity: showLabel ? 0 : 1 }}
                transition={instant ? { duration: 0 } : { duration: 0.18 }}
              />
              {/* data-cursor-лейбл — золотые капсы внутри линзы. */}
              {label ? (
                <motion.span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center px-1.5 text-center text-[10px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-gold uppercase"
                  animate={{ opacity: showLabel ? 1 : 0 }}
                  transition={instant ? { duration: 0 } : { duration: 0.18 }}
                >
                  {label}
                </motion.span>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Превью-карточка: морф линзы в фото 120px (data-cursor-image).
            Позиция — мгновенная (трекинг-точка родителя), пружина —
            только на появление/исчезание. */}
        <AnimatePresence>
          {hasPreview ? (
            <motion.div
              key="cursor-preview"
              initial={{ opacity: 0, scale: 0.35 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.35 }}
              transition={
                instant
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 28 }
              }
              className="pointer-events-none absolute top-0 left-0 overflow-hidden rounded-2xl border-2 border-gold shadow-2xl shadow-ink/30"
              style={{
                width: PREVIEW_SIZE_PX,
                height: PREVIEW_SIZE_PX,
                marginLeft: -PREVIEW_SIZE_PX / 2,
                marginTop: -PREVIEW_SIZE_PX / 2,
              }}
            >
              <Image
                src={previewImage}
                alt="Dish preview"
                fill
                sizes="120px"
                className="object-cover"
                unoptimized
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent"
              />
              {label ? (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] tracking-wider whitespace-nowrap text-cream uppercase backdrop-blur-sm">
                  {label}
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Риппл клика: один кадр-волна из точки нажатия (не трекает
          указатель — лага не воспринимает). Под reduce выключен. */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="fixed top-0 left-0 rounded-full"
            style={{
              x: ripple.x,
              y: ripple.y,
              width: LENS_SIZE_PX,
              height: LENS_SIZE_PX,
              marginLeft: -LENS_SIZE_PX / 2,
              marginTop: -LENS_SIZE_PX / 2,
              border: "1.5px solid var(--gold)",
              pointerEvents: "none",
            }}
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => removeRipple(ripple.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default CustomCursor;

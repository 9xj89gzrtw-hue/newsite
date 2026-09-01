"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";

/**
 * CustomCursor — nilov catering signature cursor (Task 5-C redesign).
 *
 * Gold dot + lagging gold ring — the cursor echoes the brand gold (the same
 * var(--gold) the wordmark dot, footer shimmer and booking badge use).
 * NO mix-blend-mode: difference is gone — blend would wash the gold out on
 * cream and turn it grey on espresso. Instead a soft drop-shadow keeps the
 * ring readable over photography.
 *
 * Layers:
 *  - Dot: 7px solid gold, INSTANT follow (raw motion values, no spring).
 *    Hovering an interactive target grows it to ~10px (scale 10/7).
 *  - Ring: fixed 44px, border 1.5px var(--gold), spring lag
 *    (stiffness 250 / damping 25). Hover: scales to ~64px, gains a
 *    rgba(196,149,106,0.12) fill and shows the `data-cursor` label in
 *    golden caps letters.
 *  - Magnet: hovering `a, button, [data-magnetic]` adds a magnet offset
 *    motion value (30% interpolation toward the element's rect center,
 *    clamped to ±48px so huge cards don't kidnap the ring). The offset is
 *    zeroed the frame the pointer leaves the element — the awwwards
 *    "cursor gravitates to the CTA" effect.
 *  - Click ripple: every primary mousedown spawns a one-shot gold ring
 *    (scale 0.5 → 2.2, opacity 0.8 → 0, ~0.5s) via AnimatePresence.
 *  - Image preview: `data-cursor-image` (used by hacc menu/services)
 *    expands the cursor into a 120px photo card (border 2px var(--gold),
 *    rounded-2xl, spring follow). While active, dot + ring hide.
 *
 * Perf (RULES §5 + AGENTS perf rules):
 *  - only transform/opacity are ever animated — the 44px ring reaches 64px
 *    via scale, the dot grows via scale, the ripple scales;
 *  - mousemove is rAF-coalesced (one frame = one batch of motion-value
 *    writes + at most one rect read, and only while magnetizing);
 *  - React state (hover/label/preview) flips only when the hovered
 *    ELEMENT IDENTITY changes — no re-render storm while sweeping;
 *  - listeners are passive.
 *
 * Gates: (pointer: fine) AND (min-width: 768px) — the body class
 * `catering-cursor` (which hides the native cursor via globals.css) is
 * toggled in sync with the same media query, so a narrow desktop window
 * always keeps its system cursor. prefers-reduced-motion: instant state
 * changes (0-duration), ripple + magnet OFF, no image preview.
 */
const DOT_SIZE_PX = 7;
/** Hover: dot grows to ~10px (scale, never width). */
const DOT_HOVER_SCALE = 10 / DOT_SIZE_PX;
const RING_SIZE_PX = 44;
/** Hover: ring reaches ~64px (scale, never width). */
const RING_HOVER_SCALE = 64 / RING_SIZE_PX;
const PREVIEW_SIZE_PX = 120;
/** Ring spring — laggy, luxurious (spec: stiffness ~250, damping ~25). */
const RING_SPRING = { stiffness: 250, damping: 25 } as const;
/** Preview follows tighter than the ring (feels responsive). */
const PREVIEW_SPRING = { stiffness: 500, damping: 32, mass: 0.4 } as const;
/** Cursor pulls 30% of the way toward the hovered element's center. */
const MAGNET_STRENGTH = 0.3;
/** ...but never more than 48px, so big media cards can't steal the ring. */
const MAGNET_MAX_PX = 48;

const INTERACTIVE_SELECTOR =
  "a,button,[data-cursor],input,select,textarea,label,[role=button]";
const MAGNET_SELECTOR = "a,button,[data-magnetic]";

type Ripple = { id: number; x: number; y: number };

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [seen, setSeen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const prefersReducedMotion = useReducedMotion();

  /* ── motion values ──────────────────────────────────────────────────── */
  // Dot: instant raw pointer position.
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  // Magnet offset (zeroed on leave) — added to the pointer to form the
  // ring's target. Kept as separate motion values per the awwwards recipe.
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const ringTargetX = useTransform([dotX, magX], ([d, m]: number[]) => d + m);
  const ringTargetY = useTransform([dotY, magY], ([d, m]: number[]) => d + m);
  const ringX = useSpring(ringTargetX, RING_SPRING);
  const ringY = useSpring(ringTargetY, RING_SPRING);
  // Preview: follows the raw pointer (not the magnetized ring).
  const previewX = useSpring(dotX, PREVIEW_SPRING);
  const previewY = useSpring(dotY, PREVIEW_SPRING);

  /* ── refs (never written during render) ─────────────────────────────── */
  const rafRef = useRef(0);
  const pendingEventRef = useRef<MouseEvent | null>(null);
  const hoverElRef = useRef<HTMLElement | null>(null);
  const magnetElRef = useRef<HTMLElement | null>(null);
  const seenRef = useRef(false);
  const rippleIdRef = useRef(0);

  /* ── gate: fine pointer + md width, body class in sync ─────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const apply = () => {
      setEnabled(mq.matches);
      // Hide the native cursor ONLY while the custom one is on screen.
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

  /* ── pointer tracking (rAF-coalesced, passive) ─────────────────────── */
  useEffect(() => {
    if (!enabled) return;

    const frame = () => {
      rafRef.current = 0;
      const ev = pendingEventRef.current;
      if (!ev) return;
      const px = ev.clientX;
      const py = ev.clientY;

      if (!seenRef.current) {
        seenRef.current = true;
        setSeen(true);
      }
      dotX.set(px);
      dotY.set(py);

      // Interactive detection — state flips only on element IDENTITY
      // change, so sweeping the pointer inside one element never re-renders.
      const t = ev.target as HTMLElement | null;
      const interactive =
        t && typeof t.closest === "function"
          ? (t.closest(INTERACTIVE_SELECTOR) as HTMLElement | null)
          : null;
      if (interactive !== hoverElRef.current) {
        hoverElRef.current = interactive;
        if (interactive) {
          setHovering(true);
          setLabel(interactive.getAttribute("data-cursor") || "");
          // data-cursor-image: 120px photo preview (hacc menu/services).
          setPreviewImage(interactive.getAttribute("data-cursor-image") || "");
          magnetElRef.current =
            typeof interactive.matches === "function" &&
            interactive.matches(MAGNET_SELECTOR)
              ? interactive
              : null;
        } else {
          setHovering(false);
          setLabel("");
          setPreviewImage("");
          magnetElRef.current = null;
        }
      }

      // Magnet: pull the ring 30% toward the hovered element's center.
      // One rect read per frame, and only while magnetizing.
      let ox = 0;
      let oy = 0;
      const magnetEl = magnetElRef.current;
      if (magnetEl && !prefersReducedMotion) {
        const r = magnetEl.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          const rawX = (r.left + r.width / 2 - px) * MAGNET_STRENGTH;
          const rawY = (r.top + r.height / 2 - py) * MAGNET_STRENGTH;
          ox = Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, rawX));
          oy = Math.max(-MAGNET_MAX_PX, Math.min(MAGNET_MAX_PX, rawY));
        }
      }
      // Separate magnet-offset motion values, zeroed when not hovering.
      magX.set(ox);
      magY.set(oy);
    };

    const onMove = (e: MouseEvent) => {
      pendingEventRef.current = e;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(frame);
      }
    };

    // Click ripple — one per primary mousedown (off under reduced motion).
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0 || prefersReducedMotion) return;
      const id = ++rippleIdRef.current;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      pendingEventRef.current = null;
    };
  }, [enabled, prefersReducedMotion, dotX, dotY, magX, magY]);

  const removeRipple = (id: number) =>
    setRipples((prev) => prev.filter((r) => r.id !== id));

  if (!enabled) return null;

  // Reduced motion: instant states — no spring (raw target = pointer, and
  // the magnet offset is permanently zero), no scale animations.
  const instant = Boolean(prefersReducedMotion);
  const ringStyleX = instant ? ringTargetX : ringX;
  const ringStyleY = instant ? ringTargetY : ringY;
  const stateTransition = instant ? { duration: 0 } : { duration: 0.2 };
  // Preview replaces dot + ring as the cursor visual while active.
  const hasPreview = Boolean(previewImage) && !instant;
  // Ring label — only meaningful while hovering with a data-cursor label.
  const showLabel = hovering && Boolean(label) && !hasPreview;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      aria-hidden="true"
    >
      {/* Dot — 7px solid gold, instant follow. Grows to ~10px on interactive
          hover (scale, never width). Soft drop-shadow instead of blend keeps
          it readable over espresso and photography alike. */}
      <motion.div
        className="fixed top-0 left-0 will-change-transform rounded-full bg-gold"
        style={{
          x: dotX,
          y: dotY,
          width: DOT_SIZE_PX,
          height: DOT_SIZE_PX,
          marginLeft: -DOT_SIZE_PX / 2,
          marginTop: -DOT_SIZE_PX / 2,
          filter: "drop-shadow(0 1px 3px rgba(26, 27, 26, 0.5))",
        }}
        animate={{
          opacity: hasPreview || !seen ? 0 : 1,
          scale: instant ? 1 : hovering ? DOT_HOVER_SCALE : 1,
        }}
        transition={stateTransition}
      />

      {/* Ring — fixed 44px, spring lag (250/25). Hover: scale → ~64px +
          gold-tint fill + label. The 1.5px gold border + drop-shadow read
          on cream, espresso and photos — no blend mode. */}
      <motion.div
        className="fixed top-0 left-0 flex items-center justify-center overflow-hidden rounded-full will-change-transform"
        style={{
          x: ringStyleX,
          y: ringStyleY,
          width: RING_SIZE_PX,
          height: RING_SIZE_PX,
          marginLeft: -RING_SIZE_PX / 2,
          marginTop: -RING_SIZE_PX / 2,
          border: "1.5px solid var(--gold)",
          filter: "drop-shadow(0 2px 6px rgba(26, 27, 26, 0.35))",
        }}
        animate={{
          scale: hasPreview
            ? 0
            : instant
              ? hovering
                ? RING_HOVER_SCALE
                : 1
              : hovering
                ? RING_HOVER_SCALE
                : 1,
          opacity: hasPreview ? 0 : seen ? 1 : 0,
          backgroundColor: hovering
            ? "rgba(196,149,106,0.12)"
            : "rgba(196,149,106,0)",
        }}
        transition={instant ? { duration: 0 } : RING_SPRING}
      >
        {/* data-cursor label — golden caps letters inside the ring. */}
        {label ? (
          <motion.span
            className="pointer-events-none px-1.5 text-center text-[10px] font-medium leading-none tracking-[0.14em] whitespace-nowrap text-gold uppercase"
            animate={{ opacity: showLabel ? 1 : 0 }}
            transition={stateTransition}
          >
            {label}
          </motion.span>
        ) : null}
      </motion.div>

      {/* Click ripple — one-shot gold ring from the click point
          (scale 0.5 → 2.2, opacity 0.8 → 0, ~0.5s). Removed on complete. */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="fixed top-0 left-0 rounded-full"
            style={{
              x: ripple.x,
              y: ripple.y,
              width: RING_SIZE_PX,
              height: RING_SIZE_PX,
              marginLeft: -RING_SIZE_PX / 2,
              marginTop: -RING_SIZE_PX / 2,
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

      {/* Image preview — 120px photo card on data-cursor-image hover.
          Border 2px var(--gold) + rounded-2xl (brand frame). Spring-tracked
          to the raw pointer. The label badge rides under the card. */}
      <AnimatePresence>
        {hasPreview && (
          <motion.div
            key="cursor-preview"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pointer-events-none fixed top-0 left-0 overflow-hidden rounded-2xl border-2 border-gold shadow-2xl shadow-ink/30"
            style={{
              x: previewX,
              y: previewY,
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
            {/* Subtle gradient overlay for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent"
            />
            {/* Label badge — shows the data-cursor label below the image */}
            {label && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-2.5 py-1 text-[10px] tracking-wider whitespace-nowrap text-cream uppercase backdrop-blur-sm">
                {label}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

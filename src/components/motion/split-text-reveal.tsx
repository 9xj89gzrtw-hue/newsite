"use client";

import { useEffect, useRef, useState } from "react";
import SplitType from "split-type";
import { animate, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type As = "h1" | "h2" | "h3" | "h4" | "p" | "span";
type Mode = "lines" | "words" | "chars";

interface SplitTextRevealProps {
  /** Plain string to split + reveal. */
  children: string;
  /** Wrapper element tag. @default 'h2' */
  as?: As;
  /** Split granularity. @default 'words' */
  mode?: Mode;
  /** Per-item stagger in seconds. Defaults: chars 0.03, words 0.06, lines 0.12. */
  stagger?: number;
  /** Initial delay in seconds. @default 0 */
  delay?: number;
  /** Per-item reveal duration. @default 0.7 */
  duration?: number;
  className?: string;
  /**
   * Optional gradient mask: each split item gets `background-clip: text` with
   * a `linear-gradient(90deg, from, to)` that fills `0% → 100%` alongside the
   * translateY reveal (Floema "word fills with brand color" effect).
   */
  gradient?: { from: string; to: string };
  /** Trigger once vs. every time it enters the viewport. @default true */
  once?: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * SplitTextReveal — line/word/char staggered text reveal with optional
 * gradient mask. The Sondaven `split-line` / Lando `split-type` signature.
 *
 * **Accessibility model (critical):** the wrapper element carries
 * `aria-label={full text}` + `role="heading"` + `aria-level` (when `as` is a
 * heading tag). The visible (split) text node is `aria-hidden="true"`. Screen
 * readers therefore read the heading normally while sighted users see the
 * masked stagger animation.
 *
 * - `split-type` (4kb MIT) does the DOM split; reverted on unmount.
 * - motion/react imperative `animate()` drives each split child
 *   (transform/opacity only — RULES §5).
 * - Container starts at `opacity: 0` and flips to `1` once split completes,
 *   avoiding any FOUC of the un-split text.
 * - `prefers-reduced-motion`: renders the plain `as` tag with `aria-label`,
 *   no splitting, no animation.
 */
export function SplitTextReveal({
  children,
  as = "h2",
  mode = "words",
  stagger,
  delay = 0,
  duration = 0.7,
  className,
  gradient,
  once = true,
}: SplitTextRevealProps) {
  const reduce = useReducedMotion();
  // C62 hydration-safety gate — see the render comment below.
  const [mountedRef, setMountedRef] = useState(false);
  useEffect(() => setMountedRef(true), []);
  const containerRef = useRef<Element | null>(null);
  const splitRef = useRef<HTMLSpanElement>(null);
  const innersRef = useRef<HTMLElement[]>([]);
  const inView = useInView(containerRef, { once, margin: "-80px" });
  const [ready, setReady] = useState(false);

  const resolvedStagger =
    stagger ?? (mode === "chars" ? 0.03 : mode === "words" ? 0.06 : 0.12);
  const isHeading = as === "h1" || as === "h2" || as === "h3" || as === "h4";
  const level = as === "h1" ? 1 : as === "h2" ? 2 : as === "h3" ? 3 : 4;

  // Setup effect: split text + wrap each split item in an overflow:hidden mask
  // span with an inner translating span (true mask reveal, not just a slide).
  // Reverted on cleanup so DOM stays clean for re-renders / hot reload.
  useEffect(() => {
    const node = splitRef.current;
    if (!node || reduce) {
      return;
    }

    const split = new SplitType(node, { types: mode });
    const items =
      mode === "lines"
        ? split.lines
        : mode === "words"
          ? split.words
          : split.chars;
    if (!items || items.length === 0) {
      return;
    }

    const isBlock = mode === "lines";
    const inners: HTMLElement[] = [];

    items.forEach((el) => {
      // Outer split element becomes the mask.
      el.style.display = isBlock ? "block" : "inline-block";
      el.style.overflow = "hidden";
      el.style.verticalAlign = "top";
      // Avoid clipping descenders (г, р, у, ц, щ) for word/char masks.
      if (!isBlock) {
        el.style.paddingBottom = "0.15em";
        el.style.marginBottom = "-0.15em";
      }
      el.style.willChange = "transform";

      // Inner span carries the actual text content and is what we animate.
      const inner = document.createElement("span");
      inner.className = "split-inner";
      inner.style.display = isBlock ? "block" : "inline-block";
      inner.style.willChange = "transform, opacity";
      if (gradient) {
        inner.style.backgroundImage = `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`;
        inner.style.backgroundClip = "text";
        inner.style.setProperty("-webkit-background-clip", "text");
        inner.style.color = "transparent";
        inner.style.setProperty("-webkit-text-fill-color", "transparent");
        inner.style.backgroundSize = "0% 100%";
        inner.style.backgroundRepeat = "no-repeat";
      }
      while (el.firstChild) {
        inner.appendChild(el.firstChild);
      }
      el.appendChild(inner);
      inners.push(inner);
    });

    innersRef.current = inners;
    setReady(true);

    return () => {
      split.revert();
      innersRef.current = [];
    };
  }, [mode, reduce, gradient?.from, gradient?.to, children]);

  // Animation effect: when inView, animate each inner span from y:110%/opacity:0
  // (and backgroundSize 0% for gradient) to y:0%/opacity:1 (and 100%). Imperative
  // `animate()` works on plain DOM nodes — no extra motion components needed.
  //
  // K4 (cycle-71, F3): deps — скаляры `gradient?.from/?.to`, НЕ объект
  // `gradient`. Родитель может передавать литерал (новая идентичность на
  // каждый рендер) — объект в deps рестартовал анимацию на каждый ререндер
  // родителя; от/до-строки стабильны и меняются только при реальной смене
  // градиента (тот же паттерн, что у setup-эффекта выше). Ключевые кадры
  // внутри читают `gradient` из замыкания — при равных from/to значения
  // эквивалентны, рестарт не нужен.
  useEffect(() => {
    if (!inView || reduce) {
      return;
    }
    const inners = innersRef.current;
    if (inners.length === 0) {
      return;
    }

    type Controls = ReturnType<typeof animate>;
    const controls: Controls[] = [];

    inners.forEach((inner, i) => {
      const keyframes = gradient
        ? {
            y: ["110%", "0%"],
            opacity: [0, 1],
            backgroundSize: ["0% 100%", "100% 100%"],
          }
        : {
            y: ["110%", "0%"],
            opacity: [0, 1],
          };

      controls.push(
        animate(inner, keyframes, {
          duration,
          delay: delay + i * resolvedStagger,
          ease: EASE,
        }),
      );
    });

    return () => {
      controls.forEach((c) => c.cancel());
    };
  }, [inView, reduce, duration, delay, resolvedStagger, gradient?.from, gradient?.to]);

  const Tag = as as React.ElementType;
  const headingAttrs = isHeading
    ? { role: "heading" as const, "aria-level": level }
    : {};

  // C62 hydration-safety: useReducedMotion() is false during SSR but true on
  // a reduce-user's first client render — branching the TREE on it directly
  // produced a hydration mismatch (React regenerated the whole page tree).
  // The first client render must match SSR; the plain static branch is only
  // allowed to swap in AFTER mount (post-hydration updates are legal).
  const reduceConfirmed = mountedRef && !!reduce;

  if (reduceConfirmed) {
    // Reduced motion: plain element with the full text as accessible name.
    // aria-label overrides visible text for AT, so the heading is announced
    // correctly without the animation scaffolding.
    return (
      <Tag className={className} aria-label={children} {...headingAttrs}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={containerRef as React.Ref<HTMLElement>}
      className={cn(className)}
      style={{ opacity: ready ? 1 : 0 }}
      aria-label={children}
      {...headingAttrs}
    >
      <span ref={splitRef} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}

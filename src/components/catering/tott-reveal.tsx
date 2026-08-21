"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * TottReveal — Talk of the Town (talkofthetownatlanta.com) scroll-reveal
 * graft (Cycle 30). Their site uses 41× Avada `fadeInLeft` elements
 * (0.3–0.9s, `top-into-view`) + Slider Revolution GSAP `power3.inOut`
 * 300ms char-split text reveals. This component reproduces both via the
 * `.tott-fade-left` / `.tott-fade-right` / `.tott-split-reveal` CSS
 * utilities (globals.css) toggled by IntersectionObserver.
 *
 * Variants:
 *  - "fade-left"  — element fades + slides in from the left (Avada fadeInLeft)
 *  - "fade-right" — element fades + slides in from the right (mirrored)
 *  - "split"      — each character of `text` animates up with staggered delay
 *                   (SR7 char-split). Use for short headlines/eyebrows only.
 *
 * `delay` adds to the per-element transition-delay (fade variants) and is
 * multiplied per-char for the split variant.
 *
 * Reduced-motion: renders children statically (no transform/opacity), matching
 * the CSS `@media (prefers-reduced-motion)` override.
 */
type Variant = "fade-left" | "fade-right" | "split";

export function TottReveal({
  children,
  text,
  variant = "fade-left",
  delay = 0,
  as: Tag = "div",
  className,
  once = true,
}: {
  children?: ReactNode;
  /** When variant="split", the text to char-split (overrides children). */
  text?: string;
  variant?: Variant;
  delay?: number;
  as?: ElementType;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, once]);

  const baseClass =
    variant === "split" ? "tott-split-reveal" : variant === "fade-right" ? "tott-fade-right" : "tott-fade-left";
  const combined = `${baseClass} ${visible ? "is-visible" : ""} ${className ?? ""}`.trim();

  // Split variant: wrap each character in a span with an index variable.
  if (variant === "split" && text !== undefined) {
    const chars = Array.from(text);
    return (
      <Tag ref={ref as never} className={combined} style={{ "--tott-fade-delay": `${delay}s` } as never}>
        {chars.map((ch, i) => (
          <span
            key={i}
            className="tott-char"
            style={{ "--tott-char-i": i + Math.round(delay * 10) } as never}
            aria-hidden="true"
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
        <span className="sr-only">{text}</span>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as never}
      className={combined}
      style={{ "--tott-fade-delay": `${delay}s` } as never}
    >
      {children}
    </Tag>
  );
}

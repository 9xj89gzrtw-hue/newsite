"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { TiltedAccent } from "@/components/catering/tilted-accent";

/**
 * GgVideoShowcase — Cycle 31, Task 4-C.
 *
 * GGCATERING-STYLE VIDEO BLOCK — section #3 of the new 17-section site
 * structure (right after hero #1 + header #2, before photo carousel #4).
 *
 * Replicates ggcatering.com's signature "video-player" block: a full-bleed
 * ~720px-tall 16:9 section with a looping muted autoplay background video
 * (poster fallback if the mp4 fails), a dark-gradient overlay, an editorial
 * overlay (eyebrow + Playfair H2 with EA signature italic-as-fragment
 * "искусство" in `--ea-red` + Russian subtitle + 2 CTA pills), and a
 * centered "Play"-pill button that toggles between two states:
 *
 *  - **default (teaser):** muted, no controls, looping b-roll.
 *  - **expanded:** unmuted, native controls visible, plays from current
 *    position. Re-click re-mutes + hides controls. (We don't have a separate
 *    full-video URL — per Task 4-C spec, just unmute + show controls on
 *    click. A simpler version of GGCatering's "teaser mp4 → Vimeo iframe
 *    swap".)
 *
 * Layout (matches GGCatering DOM):
 *   section.relative[data-header-theme=dark][aria-label]
 *   └─ div.aspect-video.relative
 *      ├─ video.absolute.inset-0.h-full.w-full.object-cover (decorative, aria-hidden)
 *      ├─ div.absolute.inset-0.bg-gradient-to-t.from-black/70.via-black/30.to-black/40 (overlay)
 *      ├─ div.absolute.inset-0.flex (overlay content — top-left aligned, padded)
 *      │  ├─ TiltedAccent "видео" (-6° tilt, gamma signature)
 *      │  ├─ p.ea-eyebrow "НАШ ПОДХОД" (gold, Barlow Semi Condensed Bold)
 *      │  ├─ h2 "Кейтеринг как <i>искусство</i>" (Playfair Display, white, italic fragment red)
 *      │  ├─ p subtitle (white/85, max-w-2xl)
 *      │  └─ div flex gap-4 — 2 CTA pills ("Смотреть меню" → #menu, "Рассчитать стоимость" → #calculator)
 *      └─ button.centered "Play" pill — toggles unmute + controls.
 *
 * Animation: framer-motion opacity 0→1 + y 24→0, viewport once:true,
 * margin "-80px", duration 0.7, ease [0.22,1,0.36,1]. Respects
 * `useReducedMotion` — when reduced, content renders statically on mount.
 *
 * `useMounted()` gates the animation branch to avoid SSR/CSR hydration
 * mismatch per AGENTS.md §14 грабли #8 (the reduce-motion query returns
 * false on server and possibly true on client).
 *
 * Accessibility: section has `aria-label`, decorative video has `aria-hidden`,
 * the play button has a descriptive `aria-pressed` + aria-label that updates
 * to reflect the current state, CTAs are real anchor links with descriptive
 * link text.
 *
 * @see docs/reference-library/ (ggcatering.com DOM capture, "video-player"
 *      section pattern)
 * @see src/components/catering/cep-simple-brilliant.tsx (sister component —
 *      also a video-bg + headline overlay, but full-section height + 0.5×
 *      slow-mo; this component uses 16:9 aspect-ratio instead and adds
 *      the editorial overlay + play-pill toggle)
 */

/** Editorial easing — Ridgewell/CEP/EA shared curve. */
const EASE = [0.22, 1, 0.36, 1] as const;

type Cta = {
  /** Visible label (Russian). */
  label: string;
  /** Anchor href — section id of the destination. */
  href: string;
};

const CTAS: Cta[] = [
  { label: "Смотреть меню", href: "#menu" },
  { label: "Рассчитать стоимость", href: "#calculator" },
];

export function GgVideoShowcase() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const animate = mounted && !reduce;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [expanded, setExpanded] = useState(false);

  /** Toggle the play-pill: unmute + reveal native controls on first click,
   *  re-mute + hide on the next click. We don't change `src` — per Task 4-C
   *  spec we have only one video file, so we just toggle presentation mode
   *  on the same element (simpler than GGCatering's teaser→iframe swap). */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !expanded;
    setExpanded(next);
    v.muted = !next;
    if (next) {
      // Reveal controls + nudge autoplay forward in case it stalled.
      v.controls = true;
      try {
        void v.play().catch(() => {
          /* autoplay can still reject on some browsers without a user
             gesture — but we're inside a click handler so this should
             succeed; swallow the rejection silently either way. */
        });
      } catch {
        /* noop */
      }
    } else {
      v.controls = false;
    }
  };

  /** Reveal-on-scroll helper for overlay-content children. */
  const reveal = (delay: number) =>
    animate
      ? {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease: EASE },
        }
      : { initial: false as const, whileInView: undefined };

  return (
    <section
      aria-label="Видео: как мы работаем"
      data-header-theme="dark"
      className="relative w-full bg-black"
    >
      {/* 16:9 video frame — GGCatering's "div.relative.aspect-video" */}
      <div className="relative aspect-video w-full">
        {/* Background teaser video — muted autoplay loop, decorative.
            `preload="metadata"` for a fast first-paint; poster fills the
            gap until the mp4 streams in. */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/hero-premium/hero-premium-6.jpg"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/media/mculinary/mculinary-hero.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay — bottom-heavier for the editorial
            text sitting at lower-left, with a softer top scrim so the
            page header (overlaid white-on-video) remains legible. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40"
        />

        {/* Editorial overlay — top-left aligned with breathing padding.
            z-10 so it sits above the gradient scrim. */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-14 lg:p-20">
          {/* Tilted handwritten accent — gamma signature -6° tilt, sits
              as a small marginalia above the eyebrow. */}
          <TiltedAccent text="видео" className="mb-4 block" />

          {/* Eyebrow — Barlow Semi Condensed Bold, uppercase, gold. */}
          <motion.p
            {...reveal(0)}
            className="mb-4"
            style={{
              fontFamily: "var(--ea-font-eyebrow)",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}
          >
            НАШ ПОДХОД
          </motion.p>

          {/* H2 — Playfair Display, white. The word "искусство" is wrapped
              in <i> per the EA signature italic-as-fragment device
              (globals.css `.ea-section-h2 i` colors it `var(--ea-red)`). */}
          <motion.h2
            {...reveal(0.08)}
            className="ea-section-h2 mb-6 max-w-4xl text-white"
          >
            Кейтеринг как <i>искусство</i>
          </motion.h2>

          {/* Subtitle — white @ 85%, max-w-2xl editorial column. */}
          <motion.p
            {...reveal(0.16)}
            className="mb-8 max-w-2xl text-white/85"
            style={{
              fontFamily: "var(--ea-font-body)",
              fontSize: "clamp(1rem, 1.1vw, 1.1rem)",
              lineHeight: 1.6,
            }}
          >
            Каждое блюдо — это режиссура вкуса, света и сервиса. От идеи
            до последнего штриха — мы делаем кино, которое можно
            попробовать.
          </motion.p>

          {/* CTA pills — 2 anchors, rounded-full, transparent bg + white
              border + white text; on hover darken the bg + slightly tint
              the border. Mobile stacks vertically, md+ sit side-by-side. */}
          <motion.div
            {...reveal(0.24)}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            {CTAS.map((cta) => (
              <a
                key={cta.href}
                href={cta.href}
                className="inline-flex items-center justify-center rounded-full border border-white/80 px-6 py-3 text-center text-white transition-colors duration-300 hover:bg-white hover:text-black"
                style={{
                  fontFamily: "var(--ea-font-eyebrow)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                }}
              >
                {cta.label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Centered "Play" pill — toggles unmute + native controls.
            GGCatering's signature interaction: a 1px-white-border pill
            centered over the video, clicking it swaps the muted teaser
            for the full player. We don't have a separate full-video URL,
            so we toggle `muted` + `controls` on the same element. */}
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={expanded}
          aria-label={
            expanded
              ? "Выключить звук и скрыть элементы управления видео"
              : "Включить звук и показать элементы управления видео"
          }
          className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 hover:opacity-90"
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid #fff",
            borderRadius: "9999px",
            padding: "8px 16px",
            fontWeight: 500,
            fontFamily: "var(--ea-font-eyebrow)",
            fontSize: "0.9rem",
            letterSpacing: "0.04em",
          }}
        >
          {/* Inline play/pause glyph + label. When expanded, swap to a
              "Pause" affordance — though the underlying behavior is
              mute-toggle, the icon shift signals the new state. */}
          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              aria-hidden="true"
              focusable="false"
              fill="currentColor"
            >
              {expanded ? (
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            {expanded ? "Пауза" : "Смотреть видео"}
          </span>
        </button>
      </div>
    </section>
  );
}

export default GgVideoShowcase;

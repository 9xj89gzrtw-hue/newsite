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
 * (poster fallback if the mp4 fails), a dark double-gradient scrim, an
 * editorial overlay (Playfair H2 with EA signature italic-as-fragment
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
 *      ├─ div.absolute.inset-0 double scrim (radial pool behind the text
 *      │   column + linear to-top base — Task 4-B readability hardening)
 *      ├─ div.absolute.inset-0.flex (overlay content — bottom-left aligned, padded)
 *      │  ├─ TiltedAccent "видео" (-6° tilt, gamma signature)
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

  /** Toggle the play-pill. Cycle 38 perf fix: the video no longer
   *  autoplays in the background — the same 5 MB mculinary-hero.mp4 was
   *  downloaded twice in parallel (hero + this block), starving the
   *  browser connection pool. Now a static poster renders by default and
   *  the <video> element only mounts on first click (user gesture →
   *  autoplay with sound is guaranteed to succeed). */
  const togglePlay = () => {
    const next = !expanded;
    setExpanded(next);
    if (!next && videoRef.current) {
      videoRef.current.pause();
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
      {/* Video frame — GGCatering's 16:9 "aspect-video" on desktop.
          On mobile the editorial overlay (tilted accent + H2 +
          body + 2 CTAs ≈ 420px) does NOT fit inside a 16:9 frame (219px at
          390px width) — `justify-end` then overflows the content UPWARD
          above the section's top edge, making "ИСКУССТВО"
          bleed into the hero above. Fix: a generous min-height on mobile
          (560px fits the overlay with breathing room), restoring
          aspect-video only at md+ where the viewport is wide enough for
          16:9 to hold the content. */}
      <div className="relative min-h-[560px] w-full md:aspect-video md:min-h-0">
        {/* Static poster by default — the <video> mounts only after the
            user clicks the Play pill (Cycle 38 perf fix: no second
            parallel download of mculinary-hero.mp4). */}
        {!expanded && (
          <img
            src="/media/hero-premium/hero-premium-6.jpg"
            alt="Банкетный зал Interfood: сервированный стол с блюдами высокой кухни"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {expanded && (
          <video
            ref={(el) => {
              videoRef.current = el;
              // Explicit play() on mount: autoplay-with-sound inside a real
              // click handler is allowed, but some browsers still need the
              // imperative nudge (Cycle 40 — critic saw a paused video).
              if (el) {
                el.controls = true;
                el.muted = false;
                void el.play().catch(() => {
                  /* autoplay rejected — user can press play in the controls */
                });
              }
            }}
            autoPlay
            controls
            playsInline
            preload="metadata"
            poster="/media/hero-premium/hero-premium-6.jpg"
            aria-label="Видео: как мы работаем"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/media/clips/catering-clip-2.mp4" type="video/mp4" />
          </video>
        )}

        {/* Dark scrim — Task 4-B readability hardening. Two stacked
            gradients keep the editorial copy WCAG-legible over the video
            both on PAUSE and in MOTION, while the top-right of the frame
            stays clear so the video itself remains visible:
            1) radial — pools black (0.55 → 0) behind the bottom-left text
               column where H2 / subtitle / CTAs sit;
            2) linear to-top — 0.78 bottom (base, up from 0.70), 0.35 mid,
               0.40 top (soft scrim so the overlaid page header stays
               legible). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(130% 90% at 20% 100%, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.28) 48%, rgba(0, 0, 0, 0) 100%), linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0.40) 100%)",
          }}
        />

        {/* Editorial overlay — bottom-left aligned with breathing padding.
            z-10 so it sits above the gradient scrim. */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-14 lg:p-20">
          {/* Tilted handwritten accent — gamma signature -6° tilt, sits
              as a small marginalia above the H2 (Task 4-B: eyebrow removed
              at the owner's request). Inline drop-shadow keeps the red
              script legible over the video. */}
          <div
            className="mb-6"
            style={{ filter: "drop-shadow(0 2px 14px rgba(0, 0, 0, 0.45))" }}
          >
            <TiltedAccent text="видео" className="block" />
          </div>

          {/* H2 — Playfair Display, white. The word "искусство" is wrapped
              in <i> per the EA signature italic-as-fragment device
              (globals.css `.ea-section-h2 i` colors it `var(--ea-red)`).
              Task 4-B: text-shadow for contrast in motion. */}
          <motion.h2
            {...reveal(0)}
            className="ea-section-h2 mb-8 mt-2 max-w-4xl text-white"
            style={{ textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)" }}
          >
            Кейтеринг как <i>искусство</i>
          </motion.h2>

          {/* Subtitle — white @ 85%, max-w-2xl editorial column.
              Task 4-B: text-shadow for contrast in motion. */}
          <motion.p
            {...reveal(0.08)}
            className="mb-8 max-w-2xl text-white/85"
            style={{
              fontFamily: "var(--ea-font-body)",
              fontSize: "clamp(1rem, 1.1vw, 1.1rem)",
              lineHeight: 1.6,
              textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)",
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
            {...reveal(0.16)}
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
                  textShadow: "0 1px 16px rgba(0, 0, 0, 0.5)",
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
            {expanded ? "Пауза" : "Смотреть"}
          </span>
        </button>
      </div>
    </section>
  );
}

export default GgVideoShowcase;

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { GoldDust } from "@/components/motion/gold-dust";
import { useHapticFeedback } from "@/components/motion/tap-feedback";

/**
 * GgVideoShowcase — Cycle 31, Task 4-C.
 *
 * GGCATERING-STYLE VIDEO BLOCK — section #3 of the new 17-section site
 * structure (right after hero #1 + header #2, before photo carousel #4).
 *
 * Replicates ggcatering.com's signature "video-player" block: a full-bleed
 * ~720px-tall 16:9 section with a looping muted background video (W4-FIX:
 * the <video> is ALWAYS mounted with preload="none" — no bytes are fetched
 * until play() — and an IntersectionObserver starts the muted loop when the
 * section enters the viewport / pauses it when it leaves; the poster
 * attribute covers the pre-play frame), a dark double-gradient scrim, an
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
 *      ├─ div.absolute.inset-0.flex (overlay content — bottom-left aligned,
 *      │  padded — W1-FIX: tilted accent "видео" removed)
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

  // Волна 1 / Task 1-c2: единый document-level тап-хаптик (вибрация 8ms
  // на тапах по button/a/[role=button]; iOS молча скипает — нет API).
  // Монтируется РОВНО ОДИН раз на страницу — здесь. Не дублировать.
  useHapticFeedback();

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  /** W4-FIX: React doesn't serialize the `muted` attribute into SSR HTML
   *  (known #10389) — pin the DOM property on mount so the muted autoplay
   *  below is never rejected. togglePlay owns `muted` afterwards. */
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = true;
  }, []);

  /** W4-FIX «видео-вау»: the clip plays as a muted loop as soon as the
   *  section is near the viewport (muted autoplay is always permitted) and
   *  pauses when it scrolls away — the 1.5MB catering-clip-2.mp4 is a
   *  DIFFERENT url from the hero's mculinary-hero.mp4 and preload="none"
   *  keeps it out of the critical path above the fold. IO rootMargin 100px
   *  starts playback just before the section is revealed. Cleanup pauses
   *  on unmount. prefers-reduced-motion: no IO at all — the poster stays
   *  and the clip plays only after a user click. */
  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // Muted in teaser state; when expanded (sound on) the prior
          // click counts as user activation, so unmuted play() is allowed
          // too — a rejection just leaves the native controls in charge.
          void video.play().catch(() => {
            /* autoplay rejected — poster / controls stay */
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, [reduce]);

  /** Toggle the play-pill: expanded → unmuted + native controls (user
   *  gesture, so play-with-sound is guaranteed); collapsed → back to the
   *  muted looping teaser (the loop keeps running). W4-FIX: collapsing no
   *  longer pauses the clip — the muted b-roll continues. */
  const togglePlay = () => {
    const next = !expanded;
    setExpanded(next);
    const video = videoRef.current;
    if (!video) return;
    if (next) {
      video.controls = true;
      video.muted = false;
      void video.play().catch(() => {
        /* rejected — the user can press play in the native controls */
      });
    } else {
      video.controls = false;
      video.muted = true;
      // Keep the muted loop alive (IO will pause it once offscreen).
      if (video.paused) {
        void video.play().catch(() => {});
      }
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
      ref={sectionRef}
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
        {/* W4-FIX: ALWAYS-mounted <video> — muted looping teaser, started
            by the IntersectionObserver above and paused offscreen.
            preload="none": the browser downloads nothing until play(); the
            poster attribute covers the pre-play frame (the old static
            <img> is gone — the video poster replaces it 1:1). The clip
            (1.5MB catering-clip-2.mp4) differs from the hero video url, so
            nothing is fetched in parallel with the hero. */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster="/media/hero-premium/hero-premium-6.jpg"
          aria-label="Видео: как мы работаем — приготовление и подача блюд"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/media/clips/catering-clip-2.mp4" type="video/mp4" />
        </video>

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

        {/* Волна 1 / Task 1-c2: GoldDust — золотая пыль над видео.
            Канвас absolute inset-0, pointer-events:none: по DOM-порядку
            НАД видео-скримом (частицы полнотелые поверх затемнения —
            читаются золотом на тёмном), ПОД редакционным контентом
            (контент z-10, Play z-20). rAF с паузами вне вьюпорта,
            reduce-motion → не рендерится. */}
        <GoldDust />

        {/* Editorial overlay — bottom-left aligned with breathing padding.
            z-10 so it sits above the gradient scrim. */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-14 lg:p-20">
          {/* H2 — Playfair Display, white. The word "искусство" is wrapped
              in <i> per the EA signature italic-as-fragment device
              (globals.css `.ea-section-h2 i` colors it `var(--ea-red)`).
              Task 4-B: text-shadow for contrast in motion. W1-FIX: the
              unlayered `.ea-section-h2` rule (color: var(--ea-ink)) beats
              the layered Tailwind `text-white` utility — an inline
              `color: "#fff"` (inline beats both) keeps the H2 white over
              the dark video. */}
          <motion.h2
            {...reveal(0)}
            className="ea-section-h2 mb-8 mt-2 max-w-4xl text-white"
            style={{
              color: "#fff",
              textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)",
            }}
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
          {/* Inline glyph + label. Collapsed (teaser): play glyph +
              «Смотреть». Expanded: mute glyph + «Выключить звук» — W4-FIX:
              collapsing no longer pauses the clip (the muted b-roll keeps
              looping), so the "Pause" affordance was wrong; the pill now
              truthfully reads as a sound toggle. */}
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
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            {expanded ? "Выключить звук" : "Смотреть"}
          </span>
        </button>
      </div>
    </section>
  );
}

export default GgVideoShowcase;

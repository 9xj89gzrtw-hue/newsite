"use client";

/**
 * GgVideoShowcase — ggcatering.com-style video player section
 *
 * Adapted to interfood branding with Russian copy. Replicates the
 * ggcatering.com video player pattern:
 *   - `aspect-video` container (16:9) via `.gg-video-frame`
 *   - Autoplay muted loop playsinline teaser in the background (z-10)
 *   - Click-to-expand play button overlay (`gg-video-play-btn`)
 *   - Fullscreen modal with native controls + sound on click
 *
 * Accessibility:
 *   - aria-labels on all interactive buttons
 *   - Escape closes the fullscreen modal
 *   - Body scroll lock while modal is open
 *   - prefers-reduced-motion: teaser does NOT autoplay (first frame shown)
 *
 * NOTE: The video file `/media/ggcatering/gg-hero-video.mp4` is TEMPORARY —
 * copied from ggcatering.com per user request ("сейчас скопируй их видео
 * временно, потом я дам свое"). A visible disclaimer is shown below the
 * video frame. To replace: move the file to a CDN (Mux / Bunny.net /
 * Cloudflare Stream / Backblaze B2 + CDN) and swap the `videoSrc` constant
 * below to the external URL — then delete the local file (RULES.md §3).
 */

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Play, X } from "lucide-react";

const VIDEO_SRC = "/media/ggcatering/gg-hero-video.mp4";

export default function GgVideoShowcase() {
  const teaserRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reduce = useReducedMotion();

  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  // When the fullscreen modal opens, pause the background teaser so the
  // two videos don't play simultaneously (and overlap audio).
  useEffect(() => {
    if (!teaserRef.current) return;
    if (isFullscreen) {
      teaserRef.current.pause?.();
    } else {
      // Resume teaser when modal closes (unless reduced motion).
      if (!reduce) {
        teaserRef.current.muted = true;
        teaserRef.current.play?.().catch(() => {
          /* autoplay can be blocked — silently ignore */
        });
      }
    }
  }, [isFullscreen, reduce]);

  // Reduced-motion: don't autoplay the teaser at all on mount — show the
  // first frame as a poster instead.
  useEffect(() => {
    if (!teaserRef.current) return;
    if (reduce) {
      teaserRef.current.pause?.();
      teaserRef.current.currentTime = 0;
    } else {
      teaserRef.current.muted = true;
      teaserRef.current.play?.().catch(() => {
        /* autoplay blocked — user can still click play */
      });
    }
  }, [reduce]);

  // Close fullscreen on Escape + lock body scroll while open.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  return (
    <section
      id="gg-video"
      className="relative w-full overflow-hidden bg-[var(--gg-charcoal-dark)] py-16 text-white lg:py-20"
    >
      {/* Soft top gradient — smoothens the transition from the white Who-We-Are
          section above into the dark video section, removing the "abrupt cut". */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 z-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250,250,247,0.95) 0%, rgba(26,26,26,0) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Compact eyebrow + heading — single row, left-aligned, so the
            video frame dominates the section instead of the copy. */}
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="gg-tagline mb-2 text-[var(--gg-lime)]">Видео</p>
            <h2 className="gg-heading-two text-white">
              Еда как <span className="gg-italic text-[var(--gg-lime)]">искусство</span>
            </h2>
          </div>
          <ul
            className="grid grid-cols-1 gap-2 text-sm text-white/85 sm:grid-cols-2 md:max-w-md md:text-base"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gg-lime)]" aria-hidden="true" />
              <span>Свежие сезонные продукты</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gg-lime)]" aria-hidden="true" />
              <span>Банкеты 50–500 гостей</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gg-lime)]" aria-hidden="true" />
              <span>Реальные события Interfood</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gg-lime)]" aria-hidden="true" />
              <span>Шеф-повара на площадке</span>
            </li>
          </ul>
        </div>

        {/* Video frame — aspect-video with autoplay muted loop teaser + click-to-fullscreen */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="gg-video-frame rounded-2xl"
        >
          {/* Teaser video — autoplay muted loop (skipped if reduced-motion).
              preload="auto" + poster ensure the first frame is visible immediately
              while the 33MB MP4 streams (HTTP 206 range requests). */}
          <video
            ref={teaserRef}
            src={VIDEO_SRC}
            poster="/media/ridgewells-hero.jpg"
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="auto"
            className="z-10 transition-opacity duration-300"
            aria-label="Тизер-видео кейтеринга Interfood"
          />

          {/* Play-full-video button overlay */}
          <button
            type="button"
            onClick={openFullscreen}
            className="gg-video-play-btn group"
            aria-label="Открыть видео в полноэкранном режиме"
          >
            <span className="gg-video-play-icon">
              <Play
                className="ml-1 h-9 w-9 text-[var(--gg-charcoal-dark)]"
                fill="currentColor"
                aria-hidden="true"
              />
            </span>
          </button>

          {/* Caption — larger + more contrast for premium feel */}
          <div className="absolute bottom-4 left-4 z-20 rounded-lg bg-black/70 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/15">
            <span className="text-sm font-medium tracking-wide text-white" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
              Interfood Catering Showreel · 2026
            </span>
          </div>
        </motion.div>

        {/* Disclaimer about temporary video */}
        <p className="mt-4 text-xs text-white/40">
          * Видео временно использовано с сайта-эталона. Будет заменено на
          собственный шоурил.
        </p>
      </div>

      {/* Fullscreen video modal — opens on click */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={closeFullscreen}
            role="dialog"
            aria-modal="true"
            aria-label="Полноэкранный просмотр видео"
          >
            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute right-4 top-4 text-white transition-colors hover:text-[var(--gg-lime)]"
              aria-label="Закрыть видео"
            >
              <X className="h-8 w-8" aria-hidden="true" />
            </button>
            <motion.div
              initial={reduce ? false : { scale: 0.92 }}
              animate={reduce ? undefined : { scale: 1 }}
              exit={reduce ? undefined : { scale: 0.92 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video w-full max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={VIDEO_SRC}
                poster="/media/ridgewells-hero.jpg"
                autoPlay
                muted
                loop
                playsInline
                controls
                className="absolute inset-0 h-full w-full rounded-lg"
                aria-label="Полное видео кейтеринга Interfood"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

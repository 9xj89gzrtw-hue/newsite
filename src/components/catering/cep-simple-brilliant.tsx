"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * CepSimpleBrilliant — Creative Edge Parties "SIMPLE & BRILLIANT" section
 * (Cycle 27).
 *
 * Full-bleed black section replicating CEP's homepage §6.4: a centered
 * stacked two-line headline ("SIMPLE &" / "BRILLIANT") sitting over a
 * looping slow-mo food b-roll video. Adapted to RU as "ПРОСТО" / "И
 * БЛЕСТЯЩЕ." (a film-title-card feel — pure typography, no other UI).
 *
 * Composition (matches CEP pixel layout):
 *   - Section height `min-h-[70vh] md:min-h-[80vh]`, `.cep-section-black`,
 *     relative, overflow-hidden.
 *   - Background `<video>`: `autoPlay muted loop playsInline`, full-bleed
 *     `object-cover`. Source = existing mculinary b-roll at
 *     `/media/mculinary/mculinary-hero.mp4` (the CEP HLS stream is
 *     segment-signed and cannot be hot-linked — per AGENTS.md §14 Phase 7
 *     pitfall #18, we substitute our own b-roll).
 *   - **0.5× playback speed** set via `<video ref>` + `useEffect` — CEP's
 *     signature slow-mo treatment (`data-config-playback-speed="0.5"` on
 *     the original).
 *   - `poster="/media/cep/cep-divider-image.png"` as graceful fallback if
 *     the mp4 fails to load.
 *   - Dark overlay `absolute inset-0 bg-black/50` between video and text
 *     (mirrors CEP's `hsla(0,0%,0%,.5)` image-block overlay).
 *   - Centered stacked headline: line 1 `ПРОСТО`, line 2 `И БЛЕСТЯЩЕ.` in
 *     `.cep-section-h2-xl` (clamp up to ~200px — CEP's 198–202px scale).
 *
 * Animation: framer-motion staggered `whileInView` reveal on each headline
 * line (opacity 0→1, y 40→0, stagger 0.2s, duration 0.8 ease).
 *
 * Reduced motion: `useReducedMotion()` + `useMounted()` gate — when true,
 * headline renders statically (no initial/whileInView) and the video still
 * autoplays (it is a media element, not a motion animation). The mounted
 * gate avoids SSR/CSR hydration mismatch per AGENTS.md §14 грабли #8.
 *
 * @see /home/z/my-project/creativeedge-analysis.md §6.4 (SIMPLE & BRILLIANT)
 */
export function CepSimpleBrilliant() {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const videoRef = useRef<HTMLVideoElement>(null);
  const showStatic = mounted && Boolean(reduce);

  // CEP signature: 0.5× playback speed on the b-roll. Set after mount so
  // the ref is available; the video element itself starts auto-playing at
  // 1× before this effect runs (one-frame discrepancy is imperceptible).
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      try {
        v.playbackRate = 0.5;
      } catch {
        /* some browsers throw on overly-fast rates; 0.5 is safe but
           guard anyway per the autoplay-policy pitfall pattern. */
      }
    }
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2, delayChildren: 0.05 },
    },
  };

  const wordVariants = showStatic
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: "easeOut" as const },
        },
      };

  return (
    <section
      data-header-theme="dark"
      aria-label="Просто и блестяще"
      className="cep-section-black relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden md:min-h-[80vh]"
    >
      {/* Background b-roll video — CEP's signature 0.5× slow-mo. */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/cep/cep-divider-image.png"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src="/media/mculinary/mculinary-hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay between video and text — mirrors CEP `hsla(0,0%,0%,.5)`. */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Centered stacked headline — pure typography, no other UI. */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        initial={showStatic ? false : "hidden"}
        whileInView={showStatic ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.h2
          variants={wordVariants}
          className="cep-section-h2-xl text-white"
        >
          SIMPLE &
        </motion.h2>
        <motion.h2
          variants={wordVariants}
          className="cep-section-h2-xl text-white"
        >
          BRILLIANT.
        </motion.h2>
      </motion.div>
    </section>
  );
}

export default CepSimpleBrilliant;

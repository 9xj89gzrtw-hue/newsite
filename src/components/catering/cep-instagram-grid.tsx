"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Play } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { CONTACTS } from "@/lib/config";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

/**
 * CepInstagramGrid — Creative Edge Parties §6.12 "FOLLOW ALONG" grid.
 *
 * Cream section with a header row ("СЛЕДИТЕ ЗА НАМИ" + @nilov_catering handle
 * link) and a 3×3 grid of 9 square Instagram thumbnails. 3 of the 9 (indices
 * 2, 5, 8 — the right column of each row) get a permanent but subtle Play
 * icon overlay to mimic CEP's Reel-play treatment on their actual Instagram
 * grid (CEP shows the icon always, not on hover).
 *
 * Each thumbnail links out to our Instagram profile. The hover state scales
 * the image up 5% (CEP's `.group-hover:scale-105` pattern, 700ms ease).
 *
 * Reveal on scroll via framer-motion staggered fade+slide (the global CEP
 * "Detailed / Fade / Slide / Ease" animation system, see analysis §6.1).
 * Respects `prefers-reduced-motion` — items snap to visible, no transform.
 *
 * @see creativeedge-analysis.md §6.12 (Instagram grid)
 */
const IG_TILES = [
  "/media/cep/ig/ig-01.jpeg",
  "/media/cep/ig/ig-02.jpeg",
  "/media/cep/ig/ig-03.jpeg",
  "/media/cep/ig/ig-04.jpeg",
  "/media/cep/ig/ig-05.jpeg",
  "/media/cep/ig/ig-06.jpeg",
  "/media/cep/ig/ig-07.jpeg",
  "/media/cep/ig/ig-08.jpeg",
  "/media/cep/ig/ig-09.jpeg",
] as const;

/** Indices that get the Reel Play-icon overlay (every 3rd, 0-based). */
const REEL_INDICES = new Set<number>([2, 5, 8]);

const IG_PROFILE_URL = "https://www.instagram.com/nilov_catering/";

export function CepInstagramGrid() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const shouldAnimate = mounted && !reduce;

  // Staggered container — children fade+slide in with 60ms stagger.
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldAnimate ? 0.06 : 0,
        delayChildren: shouldAnimate ? 0.05 : 0,
      },
    },
  };
  const itemVariants = {
    hidden: shouldAnimate
      ? { opacity: 0, y: 28 }
      : { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label="Мы в Instagram"
      data-header-theme="light"
      className="cep-section-cream w-full px-8 py-24 md:px-14 md:py-36"
    >
      {/* Header row — H2 + IG handle link */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        {/*
          Cycle 34 WOW graft — sondaven.com split-line word stagger. The H2
          "СЛЕДИТЕ ЗА НАМИ" reveals word-by-word (mask + translateY 110%→0%
          per word, 60ms stagger) instead of fading in as a block. Plain text —
          no italic-fragment design device here, so SplitTextReveal is safe.
          The cep-section-h2 + text-black styling is preserved via className.
        */}
        <SplitTextReveal
          as="h2"
          mode="words"
          className="cep-section-h2 text-black"
        >
          СЛЕДИТЕ ЗА НАМИ
        </SplitTextReveal>
        <a
          href={IG_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cep-nav-link inline-flex min-h-[44px] items-center gap-2 text-black transition-colors duration-300 hover:text-[var(--cep-red)]"
        >
          <Instagram className="size-5" aria-hidden="true" />
          <span>{CONTACTS.instagram}</span>
        </a>
      </div>

      {/* 3×3 grid of square thumbnails */}
      <motion.div
        className="grid grid-cols-3 gap-2 md:gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {IG_TILES.map((src, i) => {
          const isReel = REEL_INDICES.has(i);
          return (
            <motion.a
              key={src}
              href={IG_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram Interfood Catering — фото ${i + 1} из ленты (открывает профиль)`}
              className="group relative block aspect-square overflow-hidden bg-black/5"
              variants={itemVariants}
            >
              {/*
                Cycle 34 WOW graft — sondaven.com staggered alternating
                directional clip-path reveal across the 3×3 grid. Each tile's
                image enters with a different clip direction (cycling
                [bottom, left, top, right] via index%4) and a 50ms-per-tile
                stagger so the grid reveals as a "shutter wave" sweeping
                across the 3×3, not a uniform wipe.

                The wrapper div inside ClipPathReveal carries `aspect-square`
                matching motion.a's aspect-square so next/image `fill`
                (position:absolute) has a definite containing block — the
                inner motion.div's height is auto, so this in-flow wrapper
                establishes it via aspect-ratio.

                The existing CSS hover scale (group-hover:scale-105, was
                transition-transform duration-700) is upgraded to also animate
                filter (saturate-150 brightness-105 on group-hover) for the
                Sondaven hover="card" multiply-wash feel — image deepens on
                hover. The Reel Play icon overlay stays outside the
                ClipPathReveal so it remains always-visible (CEP shows it
                always, not on hover).
              */}
              <ClipPathReveal
                direction="alternate"
                index={i}
                duration={0.7}
                delay={i * 0.05}
                className="absolute inset-0"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={src}
                    alt={`Фото ${i + 1} из ленты Instagram Interfood Catering — ${isReel ? "видео-ролик Reel с блюдом" : "блюдо или сервировка мероприятия"}`}
                    fill
                    sizes="(max-width: 768px) 33vw, 22vw"
                    className="object-cover transition-[filter,transform] duration-500 ease-out group-hover:scale-105 group-hover:saturate-150 group-hover:brightness-105"
                  />
                </div>
              </ClipPathReveal>

              {/* Reel Play icon — always visible but subtle (CEP shows it always) */}
              {isReel && (
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-white/90 shadow-md shadow-black/20">
                    <Play
                      className="ml-0.5 size-5 fill-black text-black"
                      strokeWidth={1.5}
                    />
                  </span>
                </span>
              )}
            </motion.a>
          );
        })}
      </motion.div>
    </section>
  );
}

export default CepInstagramGrid;

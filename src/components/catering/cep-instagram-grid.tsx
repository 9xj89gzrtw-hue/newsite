"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Play } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { CONTACTS } from "@/lib/config";

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
      className="cep-section-cream w-full px-8 py-24 md:px-14 md:py-32"
    >
      {/* Header row — H2 + IG handle link */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <h2 className="cep-section-h2 text-black">СЛЕДИТЕ ЗА НАМИ</h2>
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
              aria-label={`Публикация ${i + 1} в Instagram${isReel ? " (Reel)" : ""}`}
              className="group relative block aspect-square overflow-hidden bg-black/5"
              variants={itemVariants}
            >
              <Image
                src={src}
                alt={`Публикация ${i + 1} в Instagram`}
                fill
                sizes="(max-width: 768px) 33vw, 22vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

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

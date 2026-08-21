"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { MCU_VENUES } from "@/lib/mculinary-media";

/**
 * McuVenues — mculinary "Venues" 3-card row (mculinary.com §8).
 *
 * Three square (1:1) cards on a cream section, each with hover-zoom
 * (scale 1.06, 0.5s) and a bottom-gradient caption overlay. Above the
 * grid: eyebrow "ПЛОЩАДКИ" + section heading "Где мы работаем".
 *
 * Animation: staggered fade-up reveal on the heading + each card, using
 * `motion/react`'s `whileInView` with `viewport={{ once: true, margin:
 * "-80px" }}` (the mculinary reference uses Elementor fadeInUp — same feel).
 *
 * Reduced motion: `useReducedMotion()` → when true, `initial={false}` and
 * `whileInView={undefined}` (motion renders the children visible, no
 * animation). Additionally, the reduced-motion media query in globals.css
 * disables the hover-zoom transition on `.mcu-venue-card img`.
 *
 * The `<article>` carries `.mcu-venue-card` (position: relative) so that
 * the inner `<Image fill>` is positioned correctly. Note: applying motion
 * opacity/transform to the article does not break `fill` because the
 * article itself remains the positioned ancestor.
 *
 * @see /docs/reference-library/mculinary/MCULINARY-ANALYSIS.md §5 §8, §7 wow #10
 */

type RevealProps = {
  delay: number;
};

export function McuVenues() {
  const reduce = useReducedMotion();

  const reveal = ({ delay }: RevealProps) =>
    reduce
      ? { initial: false as const, whileInView: undefined }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease: "easeOut" as const },
        };

  return (
    <section
      className="mcu-section-cream py-24"
      aria-label="Площадки и пространства"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <motion.p
            className="mcu-eyebrow mb-3 text-[var(--mcu-gold)]"
            {...reveal({ delay: 0 })}
          >
            ПЛОЩАДКИ
          </motion.p>
          <motion.h2
            className="mcu-h2 text-[var(--mcu-espresso)]"
            {...reveal({ delay: 0.08 })}
          >
            Где мы работаем
          </motion.h2>
        </div>

        <div className="mcu-venue-grid">
          {MCU_VENUES.map((venue, i) => (
            <motion.article
              key={i}
              className="mcu-venue-card group"
              {...reveal({ delay: 0.16 + i * 0.08 })}
            >
              <Image
                src={venue.src}
                alt={venue.title}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="mcu-venue-card-overlay">
                <h3 className="mcu-card-title text-white">{venue.title}</h3>
                <p className="mt-1 text-sm text-white/85">{venue.subtitle}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default McuVenues;

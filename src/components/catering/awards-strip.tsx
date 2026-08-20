"use client";

import { motion } from "framer-motion";
import { Reveal } from "./reveal";
import {
  Trophy,
  Star,
  Award,
  Crown,
  Medal,
  Heart,
  Gem,
  Flame,
} from "lucide-react";
import { SOPRANOS_AWARDS } from "@/lib/media";

/**
 * AwardsStrip — Sopranos "Our Awards" band.
 *
 * Uses lucide icons + Russian award titles (Interfood brand).
 * Layout:
 *  - Decorative gold accent line top
 *  - Centered heading: "Признание" eyebrow / "Нас отмечают" / supporting copy
 *  - Three large badge icons with hover scale + gold glow
 *  - "СМИ о нас" small text strip
 *  - Decorative gold accent line bottom
 *
 * Section bg: cream-2 (#F3F4F6). data-header-theme="light" so the sticky site
 * header switches to its light variant over this section.
 */

// Map icon name string → lucide component
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Trophy,
  Star,
  Crown,
  Medal,
  Heart,
  Gem,
  Flame,
};

export function AwardsStrip() {
  return (
    <section
      aria-label="Награды и признание"
      data-header-theme="light"
      className="relative overflow-hidden bg-cream-2 py-20"
    >
      {/* Decorative gold accent line top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Heading */}
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-gold">
              <Trophy className="size-3" />
              Признание
            </span>
            <h2
              className="mt-4 font-display uppercase text-ink"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}
            >
              Нас отмечают
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-ink/70 sm:text-base">
              Профессиональные награды за качество кухни и сервиса в Санкт-Петербурге
              и России.
            </p>
          </div>
        </Reveal>

        {/* Award badges — large, centered, hover glow */}
        <ul className="mx-auto mt-12 flex max-w-4xl flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
          {SOPRANOS_AWARDS.map((badge, i) => {
            const Icon = ICONS[badge.icon] ?? Trophy;
            return (
              <Reveal key={badge.title} delay={0.05 * (i + 1)}>
                <li className="group flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="relative flex size-40 items-center justify-center rounded-full border border-gold/20 bg-white p-3 shadow-sm transition-shadow duration-500 group-hover:shadow-[0_0_50px_-12px_rgba(212,163,115,0.55)]"
                  >
                    {/* Decorative star burst behind badge (eyebrow decor) */}
                    <Star
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1 -top-1 size-5 fill-gold/30 text-gold/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <Icon className="size-20 text-gold" />
                  </motion.div>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/60">
                    {badge.title}
                  </p>
                </li>
              </Reveal>
            );
          })}
        </ul>

        {/* "СМИ о нас" small badge row */}
        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink/40">
              СМИ о нас
            </span>
            <span className="text-sm text-ink/60">
              Санкт-Петербургские ведомости, The Village СПб, Time Out Петербург
            </span>
          </div>
        </Reveal>
      </div>

      {/* Decorative gold accent line bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
      />
    </section>
  );
}

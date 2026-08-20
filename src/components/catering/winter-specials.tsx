"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, Snowflake } from "lucide-react";
import { Reveal } from "./reveal";
import { SOPRANOS_WINTER_SPECIALS } from "@/lib/media";

/**
 * WinterSpecials — Sopranos "NEW WINTER SPECIALS" seasonal band.
 *
 * Dark navy (#1F2937 / bg-ink) high-contrast section with gold accents and
 * cream text. Uses SOPRANOS_WINTER_SPECIALS data (3 cards):
 *  1. Hearty Winter Buffet       — /media/menu-buffet.jpg        — $24/guest
 *  2. Holiday Hors d'Oeuvres     — /media/concorde-handhelds.jpg — $18/guest
 *  3. Hot Cocoa & Dessert Bar    — /media/concorde-dessert.jpg   — $15/guest
 *
 * Each card: full-width aspect-video image, dark gradient overlay, gold price
 * badge top-right, content (title / desc / "Reserve →" link), hover lift +
 * gold border + image zoom. Section uses .grain texture for premium feel.
 * All animations respect useReducedMotion().
 *
 * data-header-theme="dark" so the sticky site header switches to its dark
 * variant over this section.
 */

/** Extracts "$XX/guest" price string from a winter special description. */
function extractPrice(desc: string): string {
  const match = desc.match(/\$\d+\/guest/i);
  return match ? match[0] : "";
}

export function WinterSpecials() {
  const reduce = useReducedMotion();

  return (
    <section
      id="winter-specials"
      aria-label="New winter specials"
      data-header-theme="dark"
      className="grain relative overflow-hidden bg-ink py-20 text-cream"
    >
      {/* Decorative top border — thin gold line + bell */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 flex -translate-x-1/2 items-center gap-3"
      >
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
        <Bell className="size-4 text-gold" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
      </div>

      {/* Subtle radial gold glow behind heading */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 size-[36rem] -translate-x-1/2 rounded-full bg-gold/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Heading — staggered script → eyebrow → headline → subtext */}
        <div className="text-center">
          {!reduce && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-script text-5xl text-gold"
            >
              New
            </motion.p>
          )}
          {reduce && (
            <p className="font-script text-5xl text-gold">New</p>
          )}

          <Reveal delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-gold">
              <Snowflake className="size-3" />
              Seasonal
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h2
              className="mt-4 font-display uppercase text-cream"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Winter Specials
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-cream/70 sm:text-base">
              Warm up your winter events with our seasonal catering packages.
              Slow-braised comfort foods, hearty buffets, and indulgent dessert
              bars — perfect for holiday parties and corporate gatherings.
            </p>
          </Reveal>
        </div>

        {/* 3-card grid */}
        <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SOPRANOS_WINTER_SPECIALS.map((special, i) => {
            const price = extractPrice(special.desc);

            return (
              <Reveal key={special.title} delay={0.1 * (i + 1)}>
                <li
                  className="group relative overflow-hidden rounded-2xl border border-cream/10 bg-cream/5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-black/40"
                >
                  {/* Image area — aspect-video with zoom + overlay */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={special.image}
                      alt={special.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`object-cover ${
                        reduce
                          ? ""
                          : "transition-transform duration-700 group-hover:scale-105"
                      }`}
                    />
                    {/* Dark gradient overlay */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
                    />
                    {/* Floating price badge top-right */}
                    {price && (
                      <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1.5 font-display text-[11px] uppercase tracking-wider text-white shadow-lg shadow-black/30">
                        From {price}
                      </span>
                    )}
                  </div>

                  {/* Content area */}
                  <div className="p-6">
                    <h3 className="font-display text-2xl uppercase text-cream">
                      {special.title}
                    </h3>
                    <p
                      className="mt-2 text-cream/70"
                      style={{ fontSize: "14px", lineHeight: 1.6 }}
                    >
                      {special.desc}
                    </p>

                    {/* Reserve → link — 44px touch target */}
                    <a
                      href="#contact"
                      className="mt-5 inline-flex min-h-11 items-center gap-2 font-display text-sm uppercase tracking-wider text-gold transition-colors hover:text-gold/80"
                    >
                      <span
                        className={`inline-block ${
                          reduce
                            ? ""
                            : "transition-transform duration-300 group-hover:translate-x-1"
                        }`}
                      >
                        Reserve
                      </span>
                      <ArrowRight
                        className={`size-4 ${
                          reduce
                            ? ""
                            : "transition-transform duration-300 group-hover:translate-x-1"
                        }`}
                      />
                    </a>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {/* Decorative bottom gold line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Reveal } from "./reveal";
import { Award, Trophy, Star, Crown, Medal, Sparkles, Heart, UtensilsCrossed, Gem, Flame } from "lucide-react";

/**
 * AwardsStrip — premium awards / press badges band above footer main.
 *
 * VLM §14 backlog: "Footer: awards / press logos strip above footer main".
 * REFERENCE-SITES-ANALYSIS.md §283-300: 94% adoption of trust signals.
 *
 * Phase 8 VLM-fix: featured first card (larger, full gradient bg) + varied
 * icons per award type (was 5 near-identical achievement symbols — VLM said
 * "icon redundancy dilutes individual award identity").
 */
type Award = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  year: string;
  org: string;
  featured?: boolean;
};

const AWARDS: Award[] = [
  // Featured — flagship award (VLM-fix: visual weight variation)
  { icon: Crown, title: "Лучший кейтеринг года", year: "2024", org: "СПб Gateway Awards", featured: true },
  // Varied icons per award type (VLM-fix: no 5 near-identical achievement symbols)
  { icon: UtensilsCrossed, title: "Топ-10 кейтерингов России", year: "2024", org: "CateringForum" },
  { icon: Heart, title: "Премия за сервис", year: "2023", org: "Eventorussia" },
  { icon: Flame, title: "Золотой фестиваль", year: "2023", org: "RestFestival" },
  { icon: Star, title: "Выбор клиентов", year: "2024", org: "Яндекс.Услуги" },
  { icon: Gem, title: "Свадебный подрядчик", year: "2022", org: "Wedding Awards SPb" },
];

export function AwardsStrip() {
  const featured = AWARDS.filter((a) => a.featured);
  const regular = AWARDS.filter((a) => !a.featured);

  return (
    <section
      aria-label="Награды и достижения"
      className="relative overflow-hidden border-y border-border-line bg-cream-2 py-16"
    >
      {/* Decorative gold accent line top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <Trophy className="size-3" />
              Признание
            </span>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1.1 }}
            >
              Нас отмечают
            </h2>
            <p className="mt-3 text-sm text-ink/70 max-w-md mx-auto">
              Профессиональные награды за качество кухни и сервиса — наш
              12-летний путь отмечен индустрией.
            </p>
          </div>
        </Reveal>

        {/* Featured award — full-width gradient card (VLM-fix) */}
        {featured.length > 0 && (
          <Reveal delay={0.05}>
            <ul className="mt-10 grid gap-4">
              {featured.map((award, i) => {
                const Icon = award.icon;
                return (
                  <motion.li
                    key={`featured-${award.title}-${award.year}`}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 via-terracotta/10 to-cream-2 p-6 sm:p-8"
                  >
                    {/* Decorative shimmer overlay */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-gradient-to-br from-gold/20 to-transparent blur-2xl"
                    />
                    <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                      {/* Large gradient icon — flagship weight */}
                      <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-terracotta text-white shadow-lg shadow-gold/30 transition-transform duration-500 group-hover:scale-105">
                        <Icon className="size-8" />
                      </span>
                      <div className="flex-1">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/80">
                          ★ Флагманская награда
                        </span>
                        <h3 className="mt-1.5 font-display text-2xl text-ink sm:text-3xl">
                          {award.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink/70">
                          {award.year} · {award.org}
                        </p>
                      </div>
                      {/* Year stamp — premium feel */}
                      <span
                        aria-hidden="true"
                        className="font-display text-5xl text-gold/30 select-none sm:text-6xl"
                      >
                        {award.year}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </Reveal>
        )}

        {/* Regular awards — grid of 5 cards */}
        <Reveal delay={0.1}>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {regular.map((award, i) => {
              const Icon = award.icon;
              return (
                <motion.li
                  key={`${award.title}-${award.year}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border-line bg-white/60 p-4 text-center transition-all duration-300 hover:border-gold/40 hover:bg-white hover:shadow-lg hover:shadow-gold/5"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-cream-2 text-ink/35 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-gold/15 group-hover:to-terracotta/10 group-hover:text-gold">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium leading-tight text-ink/70 transition-colors duration-300 group-hover:text-ink">
                      {award.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/70">
                      {award.year} · {award.org}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Reveal>
      </div>

      {/* Decorative gold accent line bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
    </section>
  );
}

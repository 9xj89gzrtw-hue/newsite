"use client";

import { motion } from "framer-motion";
import { Reveal } from "./reveal";
import { Award, Trophy, Star, Crown, Medal } from "lucide-react";

/**
 * AwardsStrip — premium awards / press badges band above footer main.
 *
 * VLM §14 backlog: "Footer: awards / press logos strip above footer main".
 * REFERENCE-SITES-ANALYSIS.md §283-300: 94% adoption of trust signals.
 *
 * Shows 6 award badges in grayscale → warm gold on hover.
 * Staggered whileInView entrance (80ms per badge).
 * Each badge has: icon, title, year, organization.
 */
type Award = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  year: string;
  org: string;
};

const AWARDS: Award[] = [
  { icon: Trophy, title: "Лучший кейтеринг года", year: "2024", org: "СПб Gateway Awards" },
  { icon: Award, title: "Топ-10 кейтерингов России", year: "2024", org: "CateringForum" },
  { icon: Crown, title: "Премия за сервис", year: "2023", org: "Eventorussia" },
  { icon: Medal, title: "Золотой фестиваль", year: "2023", org: "RestFestival" },
  { icon: Star, title: "Выбор клиентов", year: "2024", org: "Яндекс.Услуги" },
  { icon: Trophy, title: "Свадебный подрядчик", year: "2022", org: "Wedding Awards SPb" },
];

export function AwardsStrip() {
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
            <p className="mt-3 text-sm text-ink/55 max-w-md mx-auto">
              Профессиональные награды за качество кухни и сервиса — наш
              16-летний путь отмечен индустрией.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {AWARDS.map((award, i) => {
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
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/40">
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

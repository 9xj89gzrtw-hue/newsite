"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, Snowflake } from "lucide-react";
import { Reveal } from "./reveal";
import { SOPRANOS_WINTER_SPECIALS } from "@/lib/media";

/**
 * WinterSpecials — сезонная секция «НОВЫЕ ЗИМНИЕ СПЕЦПРЕДЛОЖЕНИЯ».
 *
 * Тёмная navy (#1F2937 / bg-ink) high-contrast секция с золотыми акцентами и
 * cream-текстом. Использует SOPRANOS_WINTER_SPECIALS (3 карточки):
 *  1. Зимний банкет                — /media/menu-buffet.jpg        — 2400 ₽/чел
 *  2. Праздничные закуски         — /media/concorde-handhelds.jpg — 1800 ₽/чел
 *  3. Какао-бар и десерты         — /media/concorde-dessert.jpg   — 1500 ₽/чел
 *
 * Каждая карточка: полноширинное aspect-video изображение, тёмный градиент,
 * золотой бейдж цены сверху-справа, контент (название / описание / «Забронировать →»),
 * hover lift + gold border + image zoom. Секция использует .grain текстуру.
 * Все анимации учитывают useReducedMotion().
 */

/** Извлекает строку цены «XXXX ₽/чел» из описания спецпредложения. */
function extractPrice(desc: string): string {
  const match = desc.match(/\d+\s+₽\/чел/i);
  return match ? match[0] : "";
}

export function WinterSpecials() {
  const reduce = useReducedMotion();

  return (
    <section
      id="winter-specials"
      aria-label="Новые зимние спецпредложения"
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
              Новые
            </motion.p>
          )}
          {reduce && (
            <p className="font-script text-5xl text-gold">Новые</p>
          )}

          <Reveal delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-gold">
              <Snowflake className="size-3" />
              Сезон
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
              Зимние спецпредложения
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mx-auto mt-5 max-w-2xl text-sm text-cream/70 sm:text-base">
              Согрейте ваши зимние мероприятия нашими сезонными пакетами кейтеринга.
              Томлёные блюда уютной кухни, сытные буфеты и роскошные десертные
              станции — идеально для новогодних праздников и корпоративных встреч.
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
                        от {price}
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

                    {/* Забронировать → ссылка — 44px touch target */}
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
                        Забронировать
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

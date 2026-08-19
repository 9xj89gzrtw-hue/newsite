"use client";

import { motion } from "framer-motion";
import { ChefHat, Truck, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Pillars — dual brand-pillar content section (Salt Block pattern:
 * "CHEF CRAFTED" / "FARM FRESH"). Adapted to:
 *   «ШЕФ-КРАФТ»  vs  «ВЫЕЗД-СЕРВИС».
 *
 * Two equal cards contrasting the two halves of the value proposition:
 * the craft of the kitchen vs. the logistics of field service.
 */
const PILLARS = [
  {
    icon: ChefHat,
    eyebrow: "Кухня",
    title: "Шеф-крафт",
    desc: "Сезонные продукты с фермерских хозяйств, авторские рецепты, ручная сборка каждого блюда. Открытая кухня на мероприятии — гости видят процесс.",
    points: ["Сезонное меню", "Фермерские продукты", "Открытая кухня", "Авторская подача"],
    accent: "from-gold/15 to-terracotta/10",
    image: "/media/menu-banquet.jpg",
  },
  {
    icon: Truck,
    eyebrow: "Сервис",
    title: "Выезд-сервис",
    desc: "Полная логистика под ключ: мебель, посуда, текстиль, техника, доставка и монтаж. Команда официантов и сомелье — на месте с утра до последнего гостя.",
    points: ["Мебель и текстиль", "Фарфор и стекло", "Доставка и монтаж", "Официанты и сомелье"],
    accent: "from-sage/15 to-gold/10",
    image: "/media/menu-buffet.jpg",
  },
];

export function Pillars() {
  return (
    <section
      aria-label="Наши принципы"
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-gold animate-pulse" />
              Два начала
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
            >
              Кухня и сервис —{" "}
              <span className="gradient-text italic">одно целое</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-ink/60">
              Идеальный праздник рождается, когда безупречная еда встречает
              безупречную подачу. Мы отвечаем за обе половины.
            </p>
          </Reveal>
        </div>

        {/* Pillar cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={i * 0.15}>
                <motion.article
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-line bg-cream-2 card-lift"
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  {/* Top image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={p.image}
                      alt=""
                      aria-hidden="true"
                      className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cream-2 via-cream-2/40 to-transparent" />
                    {/* Icon badge */}
                    <div className="absolute bottom-4 left-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-7 md:p-8">
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                      {p.eyebrow}
                    </span>
                    <h3 className="mt-2 font-display text-3xl text-ink md:text-4xl">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-ink/70 md:text-base">
                      {p.desc}
                    </p>

                    <ul className="mt-6 grid grid-cols-2 gap-2">
                      {p.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2 text-xs text-ink/65 md:text-sm"
                        >
                          <span
                            aria-hidden="true"
                            className="inline-block size-1.5 rounded-full bg-gold"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <a
                        href="#services"
                        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink transition-colors duration-300 hover:text-gold"
                      >
                        Узнать больше
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

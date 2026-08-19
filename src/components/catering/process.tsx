"use client";

import { motion } from "framer-motion";
import { Sparkles, PenTool, Utensils, PartyPopper } from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Process — emotional process timeline (Creative Edge pattern:
 * 01-DREAM → 02-BUILD → 03-SAVOR). Adapted to catering journey:
 * 01 МЕЧТА → 02 ПРОЕКТ → 03 ПОДАЧА → 04 ПРАЗДНИК.
 *
 * Horizontal connecting line on desktop, vertical stack on mobile.
 * whileInView staggered reveal (delay: index*0.15) like the About stat cards.
 */
const STEPS = [
  {
    num: "01",
    icon: Sparkles,
    title: "Мечта",
    desc: "Знакомимся, слушаем вашу идею праздника, подбираем формат и площадку под бюджет и повод.",
  },
  {
    num: "02",
    icon: PenTool,
    title: "Проект",
    desc: "Составляем индивидуальное меню и смету. Дегустация по запросу. Фиксируем дату и детали.",
  },
  {
    num: "03",
    icon: Utensils,
    title: "Подача",
    desc: "В день мероприятия: доставка, монтаж, открытая кухня, официанты и сомелье на месте.",
  },
  {
    num: "04",
    icon: PartyPopper,
    title: "Праздник",
    desc: "Подаём блюда в ритме торжества. Убираем за собой — вы наслаждаетесь моментом и гостями.",
  },
];

export function Process() {
  return (
    <section
      id="process"
      aria-label="Как мы работаем"
      className="relative overflow-hidden bg-cream py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <span className="size-1.5 rounded-full bg-gold animate-pulse" />
              Как мы работаем
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
            >
              Четыре шага{" "}
              <span className="gradient-text italic">до праздника</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-ink/60">
              От первого звонка до последнего гостя — каждый этап ведёт команда,
              которая любит своё дело.
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <div className="relative mt-16 md:mt-20">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border-line-dark to-transparent md:block"
          />

          <ol className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.num} delay={i * 0.12}>
                  <motion.li
                    className="group relative flex flex-col items-start md:items-center md:text-center"
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Number node */}
                    <div className="relative z-10 mb-6 flex size-24 items-center justify-center rounded-full border border-border-line bg-white shadow-lg shadow-ink/5 transition-all duration-500 group-hover:border-gold/50 group-hover:shadow-gold/15 md:size-24">
                      <span className="font-display text-3xl text-ink/15 transition-colors duration-500 group-hover:text-gold/40">
                        {step.num}
                      </span>
                      <span className="absolute -bottom-3 flex size-11 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-md shadow-gold/30">
                        <Icon className="size-5" />
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-gold">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/60 md:mx-auto">
                      {step.desc}
                    </p>
                  </motion.li>
                </Reveal>
              );
            })}
          </ol>
        </div>

        {/* CTA */}
        <Reveal delay={0.3}>
          <div className="mt-16 text-center">
            <a
              href="#calculator"
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-gold transition-all duration-300 hover:bg-gold/20 hover:border-gold/50 hover:-translate-y-0.5"
            >
              Рассчитать мой праздник
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

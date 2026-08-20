"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import { Sparkles, PenTool, Utensils, PartyPopper, ChevronDown } from "lucide-react";
import { Reveal } from "./reveal";
import type { LucideIcon } from "lucide-react";

/**
 * Process — emotional process timeline (Creative Edge pattern:
 * 01-DREAM → 02-BUILD → 03-SAVOR). Adapted to catering journey:
 * 01 МЕЧТА → 02 ПРОЕКТ → 03 ПОДАЧА → 04 ПРАЗДНИК.
 *
 * Desktop: horizontal 4-step grid with scroll-driven gold progress-fill on
 * the connecting line + active-step highlighting via useInView (Task 2-b §5).
 * Mobile: vertical spine timeline with gold dot-spine (md:hidden).
 * Each step has an expandable "Подробнее" block (gridTemplateRows 0fr→1fr,
 * FAQ pattern) listing what's included at that stage.
 */
const STEPS: Array<{
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  details: string[];
}> = [
  {
    num: "01",
    icon: Sparkles,
    title: "Мечта",
    desc: "Знакомимся, слушаем вашу идею праздника, подбираем формат и площадку под бюджет и повод.",
    details: [
      "Бесплатная консультация 30 минут",
      "Подбор формата: фуршет / банкет / кофе-брейк",
      "Подбор площадки под ваш бюджет",
      "Предварительная смета в течение 1 дня",
    ],
  },
  {
    num: "02",
    icon: PenTool,
    title: "Проект",
    desc: "Составляем индивидуальное меню и смету. Дегустация по запросу. Фиксируем дату и детали.",
    details: [
      "Индивидуальное меню под повод и сезон",
      "Смета с прозрачной детализацией",
      "Дегустация блюд (по запросу)",
      "Договор и фиксация даты",
    ],
  },
  {
    num: "03",
    icon: Utensils,
    title: "Подача",
    desc: "В день мероприятия: доставка, монтаж, открытая кухня, официанты и сомелье на месте.",
    details: [
      "Доставка за 3–4 часа до начала",
      "Монтаж оборудования и сервировка",
      "Открытая кухня с шеф-поваром",
      "Официанты и сомелье на месте",
    ],
  },
  {
    num: "04",
    icon: PartyPopper,
    title: "Праздник",
    desc: "Подаём блюда в ритме торжества. Убираем за собой — вы наслаждаетесь моментом и гостями.",
    details: [
      "Подача блюд в ритме торжества",
      "Сомелье и бармен на месте",
      "Демонтаж и уборка после мероприятия",
      "Отчётные документы на следующий день",
    ],
  },
];

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Section scroll progress — drives the gold fill on the desktop connecting line.
  // offset picks "center center" so the line starts filling as the timeline enters
  // the viewport's middle band and completes by the time it exits.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const lineScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-label="Как мы работаем"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-cream py-24 md:py-32"
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
              Четыре шага{"\u00A0"}
              <span className="gradient-text italic">до праздника</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-base leading-relaxed text-ink/70">
              От первого звонка до последнего гостя — каждый этап ведёт команда,
              которая любит своё дело.
            </p>
          </Reveal>
        </div>

        {/* Desktop Timeline — horizontal 4-step grid with scroll-driven gold line.
            Hidden on mobile (md:hidden flips to md:block). */}
        <div className="relative mt-16 hidden md:mt-20 md:block">
          {/* Connecting line — gold progress-fill (Task 2-b §5).
              Static track (transparent → border-line-dark → transparent) underneath,
              with a gold gradient fill on top whose scaleX follows scrollYProgress.
              Transform-origin: left so the fill grows from left to right. */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-12 h-[2px] bg-gradient-to-r from-transparent via-border-line-dark to-transparent"
          >
            <motion.div
              className="h-full w-full origin-left bg-gradient-to-r from-gold to-terracotta"
              style={{ scaleX: reduce ? 1 : lineScaleX }}
            />
          </div>

          <ol className="grid grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <DesktopStep key={step.num} step={step} index={i} />
            ))}
          </ol>
        </div>

        {/* Mobile vertical spine timeline (Task 2-b §5).
            Left border-l-2 border-gold/30 acts as the spine; each step has a
            dot positioned on the spine (absolute -left). Content lives on the
            right side. Hidden on md+ screens. */}
        <ol className="mt-12 space-y-8 border-l-2 border-gold/30 pl-8 md:hidden">
          {STEPS.map((step, i) => (
            <MobileStep key={step.num} step={step} index={i} />
          ))}
        </ol>

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

/**
 * DesktopStep — single horizontal step in the 4-col grid.
 * Active-step highlighting via useInView (Task 2-b §5): when 60% of the step
 * is visible, scale the icon node (1.0 → 1.15) and brighten the number
 * (text-ink/70 → text-bordeaux). Transition duration 0.4 for smoothness.
 */
function DesktopStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.6 });
  const Icon = step.icon;

  return (
    <Reveal delay={index * 0.12}>
      <motion.li
        ref={ref}
        className="group relative flex flex-col items-center text-center"
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Number node — scales + border brightens when active */}
        <motion.div
          className="relative z-10 mb-6 flex size-24 items-center justify-center rounded-full border bg-white shadow-lg shadow-ink/5"
          animate={{
            scale: inView && !reduce ? 1.15 : 1,
            borderColor: inView
              ? "rgba(196,149,106,0.5)"
              : "rgba(229,222,213,1)",
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="font-display text-3xl"
            animate={{
              color: inView ? "rgb(184,134,11)" : "rgba(26,26,26,0.15)",
            }}
            transition={{ duration: 0.4 }}
          >
            {step.num}
          </motion.span>
          <span className="absolute -bottom-3 flex size-11 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-md shadow-gold/30">
            <Icon className="size-5" />
          </span>
        </motion.div>

        {/* Title */}
        <h3 className="font-display text-2xl text-ink transition-colors duration-300 group-hover:text-gold">
          {step.title}
        </h3>

        {/* Description */}
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/70 md:mx-auto">
          {step.desc}
        </p>

        {/* Expandable details */}
        <ExpandableDetails items={step.details} stepNum={step.num} />
      </motion.li>
    </Reveal>
  );
}

/**
 * MobileStep — single step in the vertical spine timeline.
 * Has a gold dot positioned on the spine (border-l-2 left edge).
 * Content lives on the right side of the spine.
 */
function MobileStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.4, once: false });
  const Icon = step.icon;

  return (
    <motion.li
      ref={ref}
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Gold dot on spine — positioned on the border-l-2 left edge.
          -left-[42px] pulls the dot onto the spine (account for the pl-8
          on the parent + the border-l-2 width + half the dot width). */}
      <motion.div
        className="absolute -left-[42px] top-1 size-4 rounded-full border-2 border-gold bg-cream"
        animate={{
          scale: inView && !reduce ? 1.25 : 1,
          backgroundColor: inView
            ? "rgb(196,149,106)"
            : "rgba(250,248,245,1)",
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Step header — icon + number + title */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-md shadow-gold/30">
          <Icon className="size-5" />
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-ink/70">
          {step.num}
        </span>
        <h3 aria-hidden="true" className="font-display text-xl text-ink">{step.title}</h3>
      </div>

      <p className="mt-2 text-sm text-ink/70">{step.desc}</p>

      <ExpandableDetails items={step.details} stepNum={step.num} />
    </motion.li>
  );
}

/**
 * ExpandableDetails — "Подробнее" button toggles a grid-rows 0fr → 1fr
 * animation (FAQ pattern, RULES §5-compliant: gridTemplateRows is explicitly
 * allowed). ChevronDown rotates 180° when open.
 */
function ExpandableDetails({ items, stepNum }: { items: string[]; stepNum: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open ? "true" : "false"}
        aria-controls={`step-content-${stepNum}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gold transition-colors duration-200 hover:text-bordeaux min-h-[44px] px-2"
      >
        Подробнее
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex"
        >
          <ChevronDown className="size-3" />
        </motion.span>
      </button>

      {/* Grid-rows 0fr → 1fr — FAQ pattern. */}
      <motion.div
        id={`step-content-${stepNum}`}
        className="grid"
        initial={false}
        animate={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        transition={{
          duration: reduce ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="overflow-hidden">
          <ul className="mt-3 space-y-1.5 text-xs text-ink/70">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

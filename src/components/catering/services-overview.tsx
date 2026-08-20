"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { OutlineButton } from "./outline-button";
import { SectionHeader } from "./section-header";

/**
 * ServicesOverview — Ridgewells two-up 50/50 split service-card grid.
 *
 * Pattern source: docs/RIDGEWELLS-ANALYSIS.md §2.4-2.5, §5.2, §9 (P1.3),
 * §10.3. Ridgewells shows 4 service categories in 2 rows × 2 cols,
 * full-bleed split, image 16:10 top, 48-56px serif title, 2-line body,
 * square outline "View More" button. Image zooms subtly on hover (0.4s).
 *
 * This is an EDITORIAL OVERVIEW that sits above the existing interactive
 * 3D Services grid (services.tsx) — giving users a calm, scannable
 * "what we do" before the detailed interactive cards. The existing grid
 * remains for the wow-factor 3D flip + modal experience.
 *
 * 4 categories mapped to Ridgewells' Corporate/Weddings/Social/Major:
 *   1. Свадебный банкет (Weddings)
 *   2. Корпоративы (Corporate)
 *   3. Частные мероприятия (Social/Private)
 *   4. Крупные события (Major Events)
 */

const EASE = [0.4, 0, 0.2, 1] as const;

type OverviewCard = {
  title: string;
  body: string;
  image: string;
  alt: string;
  href: string;
  /** Optional eyebrow tag above the title (Ridgewells category tag). */
  tag: string;
};

const CARDS: OverviewCard[] = [
  {
    title: "Свадьбы",
    tag: "Торжество под ключ",
    body: "Полное сопровождение свадебного торжества: индивидуальное меню, welcome-зона с канапе и игристым, сервировка под концепцию, официанты и сомелье.",
    image: "/media/event-04.jpg",
    alt: "Свадебный банкет — сервированный стол с цветочной композицией",
    href: "#services",
  },
  {
    title: "Корпоративы",
    tag: "Имиджевые события",
    body: "Кейтеринг для гал, презентаций, новогодних корпоративов и пикников. Безупречное качество блюд и сервис, пунктуальность — для имиджевых событий.",
    image: "/media/event-02.jpg",
    alt: "Корпоративное мероприятие — фуршетная линия для гостей",
    href: "#services",
  },
  {
    title: "Частные приёмы",
    tag: "Душевные собрания",
    body: "От камерных ужинов до масштабных праздников: дни рождения, юбилеи, домашние вечеринки, загородные пикники. Привозим ресторан к вам.",
    image: "/media/event-03.jpg",
    alt: "Частный приём — накрытый стол для ужина дома",
    href: "#services",
  },
  {
    title: "Крупные события",
    tag: "Масштаб и точность",
    body: "Банкеты на 300+ гостей, выставки, премии, городские праздники. Точность логистики, скорость подачи и уровень гостеприимства международного класса.",
    image: "/media/event-09.jpg",
    alt: "Крупное событие — банкетный зал с сотнями гостей",
    href: "#services",
  },
];

function OverviewCardItem({ card, index }: { card: OverviewCard; index: number }) {
  const reduce = useReducedMotion();
  const isReversed = index % 2 === 1;

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 2) * 0.1 }}
      className="ridge-card group relative grid items-center gap-8 border-t border-ink/10 py-12 md:grid-cols-2 md:gap-14 md:py-16"
    >
      {/* Image — 16:10 Ridgewells aspect, hover-zoom via .ridge-img-zoom
          (triggered by parent .ridge-card:hover). Subtle shadow for depth. */}
      <div className={`relative aspect-[16/10] overflow-hidden rounded-sm shadow-md shadow-ink/10 ${isReversed ? "md:order-2" : ""}`}>
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="ridge-img-zoom object-cover"
        />
        {/* Subtle gradient for text legibility on hover caption */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-70" />
        {/* Caption reveal on hover (Ridgewells SHOW_ON_HOVER) */}
        <div className="ridge-caption absolute bottom-4 left-4 text-cream">
          <span className="rounded-full bg-ink/55 px-3 py-1 font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em] backdrop-blur-sm">
            {card.tag}
          </span>
        </div>
      </div>

      {/* Text block — 48-56px serif title, 2-line body, outline View More */}
      <div className={isReversed ? "md:order-1" : ""}>
        <span className="eyebrow text-bordeaux">{card.tag}</span>
        <h3
          className="mt-4 font-display text-ink"
          style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05, letterSpacing: "-0.015em" }}
        >
          {card.title}
        </h3>
        <p className="mt-5 max-w-md text-[1.02rem] leading-[1.55] text-ink/70">{card.body}</p>
        <div className="mt-7 text-ink">
          <OutlineButton href={card.href} variant="light">
            Смотреть подробнее
          </OutlineButton>
        </div>
      </div>
    </motion.article>
  );
}

export function ServicesOverview() {
  const reduce = useReducedMotion();

  return (
    <section
      id="services-overview"
      data-header-theme="light"
      aria-labelledby="services-overview-headline"
      className="section-light bg-cream py-24 md:py-36"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Section header — Ridgewells editorial rhythm */}
        <SectionHeader
          eyebrow="Что мы делаем"
          headline={
            <>
              Кейтеринг полного цикла
              <br />
              <span className="italic text-bordeaux">для любого события.</span>
            </>
          }
          lead="От фуршета на 20 человек до банкета на 500 гостей — мы привозим всё: посуду, мебель, текстиль, обслуживание. Ниже — четыре направления, в которых мы работаем чаще всего."
          tone="light"
          align="left"
          className="mb-14 max-w-3xl"
        />

        {/* 2-up cards — full-width split, Ridgewells §2.4 layout */}
        <div className="divide-y divide-ink/10">
          {CARDS.map((card, i) => (
            <OverviewCardItem key={card.title} card={card} index={i} />
          ))}
        </div>

        {/* Closing CTA — "Все услуги" link to the detailed interactive grid */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-16 flex justify-center"
        >
          <Link
            href="#services"
            className="font-sans text-[0.85rem] font-semibold uppercase tracking-[0.22em] text-ink underline-offset-[6px] transition-colors hover:text-bordeaux hover:underline"
          >
            Смотреть все 11 услуг
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

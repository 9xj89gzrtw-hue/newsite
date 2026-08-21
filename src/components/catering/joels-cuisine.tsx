"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * JoelsCuisine — joels.com "Cuisine" 3-up card grid (Cycle 24).
 *
 * Three editorial cards in a row, each showing a portrait (267×326 aspect)
 * food/event photo + a 28px Playfair label below. No body text, no button.
 * On hover, the image scales 1.05 over 0.7s (joels' `.joel-img-zoom` rule).
 *
 * Section header follows joels' rhythm:
 *   - Eyebrow "НАША КУХНЯ" — sage, 11px, 0.4em tracking
 *   - Headline "Три направления вкуса" — 50px Playfair, ink, lh 1.1
 *
 * Layout: max-w-[1070px] between page borders on lg+, gap-8 grid, 3 cols.
 *
 * Source: docs/JOELS-ANALYSIS.md §9 P2.5, §13 (cuisine section), §14 CSS.
 *
 * Image selection rationale:
 *   - ЕДА       → /media/ridgewells-scallops.jpg (seared scallops, real food)
 *   - НАПИТКИ   → /media/concorde-dessert.jpg    (dessert plating, beverage context)
 *   - СОБЫТИЯ   → /media/event-wedding-light.jpg (wedding banquet, events context)
 */
type CuisineCard = {
  label: string;
  src: string;
  alt: string;
  href: string;
};

const CARDS: CuisineCard[] = [
  {
    label: "Еда",
    src: "/media/ridgewells-scallops.jpg",
    alt: "Авторское блюдо — обжаренные гребешки на подушке из сезонных овощей — Interfood Catering",
    href: "#menu",
  },
  {
    label: "Напитки",
    src: "/media/concorde-dessert.jpg",
    alt: "Десертная подача и напитки — Interfood Catering",
    href: "#services",
  },
  {
    label: "События",
    src: "/media/event-wedding-light.jpg",
    alt: "Свадебный банкет под открытым небом — Interfood Catering",
    href: "#gallery",
  },
];

function CuisineCardItem({
  card,
  index,
  reduce,
}: {
  card: CuisineCard;
  index: number;
  reduce: boolean | null;
}) {
  return (
    <motion.a
      href={card.href}
      aria-label={`${card.label} — перейти к разделу`}
      className="joel-img-zoom group block"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {/* Image — 4/3 landscape (matches our available food photography,
          joels.com uses portrait 267×326 but our food library is landscape).
          object-cover with object-center keeps the plated dish framed. */}
      <div className="joel-img-zoom relative aspect-[4/3] w-full overflow-hidden bg-cream-2 shadow-sm">
        <Image
          src={card.src}
          alt={card.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.1]"
        />
      </div>
      {/* 28px Playfair label below (no body, no button) */}
      <h3 className="mt-5 font-serif text-[28px] font-normal leading-tight text-ink">
        {card.label}
      </h3>
    </motion.a>
  );
}

export function JoelsCuisine() {
  const reduce = useReducedMotion();
  return (
    <section
      id="joels-cuisine"
      aria-labelledby="joels-cuisine-headline"
      className="bg-cream py-24 md:py-28"
    >
      <div className="joel-content-frame">
        {/* Eyebrow + headline — joels rhythm */}
        <div className="mb-12 flex flex-col gap-3 md:mb-14">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="joel-eyebrow"
          >
            Наша кухня
          </motion.p>
          <motion.h2
            id="joels-cuisine-headline"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="joel-section-title max-w-[640px]"
          >
            Три направления вкуса
          </motion.h2>
        </div>

        {/* 3-up card grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {CARDS.map((card, i) => (
            <CuisineCardItem
              key={card.label}
              card={card}
              index={i}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default JoelsCuisine;

"use client";

/**
 * GgFeatureCollage — ggcatering.com "Feature Collage" pattern adapted to
 * Interfood (Russian content, real catering imagery).
 *
 * Three alternating dark/light text+image blocks. Each block has:
 *   - A small uppercase tagline eyebrow
 *   - A large Poppins heading-two (with optional italic emphasis span)
 *   - A paragraph with optional <strong>
 *   - A 2×2 asymmetric image collage (alternating portrait/square aspect
 *     with subtle vertical offsets for an organic, editorial feel)
 *   - An optional CTA pill button
 *
 * The collage sits to the left or right of the text and alternates per
 * block. Enter-on-scroll reveals use transform-only motion (x-offset on
 * the collage, y-offset on the text) and respect prefers-reduced-motion.
 *
 * Layout convention: child of <main className="flex min-h-screen flex-col bg-cream">.
 * The outer section paints a solid white background so each block's own
 * bg can be opaque without bleeding through to neighbour blocks.
 */

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface FeatureBlock {
  /** Small uppercase eyebrow label (tagline). */
  eyebrow: string;
  /** Large display heading — JSX to allow inline <span> italic emphasis. */
  heading: React.ReactNode;
  /** Paragraph body — JSX to allow inline <strong>. */
  body: React.ReactNode;
  /** Exactly 4 images laid out in a 2×2 collage. */
  images: { src: string; alt: string }[];
  /** Optional CTA pill button at the foot of the text column. */
  cta?: { label: string; href: string };
  /** Block background variant — alternating dark/light. */
  variant: "dark" | "light";
  /** Which side the collage sits on (desktop). Text goes the other side. */
  imagePosition: "left" | "right";
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const FEATURES: FeatureBlock[] = [
  {
    eyebrow: "Фишка",
    variant: "dark",
    imagePosition: "right",
    heading: (
      <>
        Когда еда становится{" "}
        <span className="gg-italic text-[var(--gg-lime)]">
          иммерсивным опытом
        </span>
      </>
    ),
    body: (
      <>
        Великая еда становится незабываемой, когда её pairing с иммерсивным
        опытом. Для каждого события мы продумываем не только меню, но и подачу:
        станции, где гости взаимодействуют с блюдом, дегустационные карты,
        флористика.{" "}
        <strong>Самые запоминающиеся события не просто кормят — они вовлекают.</strong>
      </>
    ),
    images: [
      {
        src: "/media/gamma-private-event.webp",
        alt: "Частный банкет от Interfood",
      },
      {
        src: "/media/gamma-table-birds-eye.webp",
        alt: "Сервировка стола — вид сверху",
      },
      { src: "/media/concorde-dessert.jpg", alt: "Десертная станция" },
      { src: "/media/ridgewells-scallops.jpg", alt: "Гребешки на фуршете" },
    ],
    cta: { label: "Обсудить концепцию", href: "#contact" },
  },
  {
    eyebrow: "Опыт",
    variant: "light",
    imagePosition: "left",
    heading: (
      <>
        За 11 лет —{" "}
        <span className="gg-italic">довели до науки</span>
      </>
    ),
    body: (
      <>
        От планирования рассадки до размещения food-станций, барных зон и
        логистики отходов — мы продумали всё. Что это значит?{" "}
        <strong>Никаких очередей для ваших гостей</strong> — нигде. Математика
        события и операционное мастерство у нас в крови.
      </>
    ),
    images: [
      { src: "/media/concorde-boardroom.webp", alt: "Банкет в конференц-зале" },
      { src: "/media/concorde-handhelds.jpg", alt: "Фуршетные закуски" },
      { src: "/media/concorde-avo-toast.jpg", alt: "Тосты с авокадо" },
      { src: "/media/concept-banquet-table.jpg", alt: "Длинный банкетный стол" },
    ],
    cta: { label: "Посмотреть галерею", href: "#gallery" },
  },
  {
    eyebrow: "Еда и напитки",
    variant: "light",
    imagePosition: "right",
    heading: (
      <>
        Наша еда — <span className="gg-italic">очень хороша</span>
      </>
    ),
    body: (
      <>
        У традиционного кейтеринга не лучшая репутация. Мы её меняем. Меню
        индивидуальное, креативное, разработанное под ваше событие. Безупречный
        послужной список по удовлетворённости гостей.{" "}
        <strong>Приходите на дегустацию — убедитесь сами.</strong>
      </>
    ),
    images: [
      { src: "/media/ridgewells-veg-mosaic.jpg", alt: "Овощная мозаика от шефа" },
      { src: "/media/ridgewells-gala.jpg", alt: "Гала-ужин" },
      { src: "/media/ridgewells-wedding.webp", alt: "Свадебный банкет" },
      { src: "/media/ridgewells-servers.webp", alt: "Сервировка и подача" },
    ],
    cta: { label: "Заказать дегустацию", href: "#contact" },
  },
];

/* ------------------------------------------------------------------ */
/* Sub-component                                                       */
/* ------------------------------------------------------------------ */

/**
 * GgFeatureBlock — a single dark/light text+image block.
 *
 * The 2×2 collage alternates portrait (3/4) and square (1/1) cells with
 * subtle vertical offsets to break the grid's rigidity. Each tile inherits
 * the `.gg-collage-cell` hover-zoom behaviour from globals.css.
 */
function GgFeatureBlock({ block }: { block: FeatureBlock }) {
  const isDark = block.variant === "dark";
  const bg = isDark ? "bg-[var(--gg-charcoal-dark)]" : "bg-white";
  const text = isDark ? "text-white" : "text-[var(--gg-charcoal-dark)]";
  const eyebrowColor = isDark
    ? "text-[var(--gg-lime)]"
    : "text-[var(--gg-ash)]";

  const reduce = useReducedMotion();

  // Per-tile vertical offset for an organic, editorial feel.
  const tileOffsets = ["translate-y-0", "translate-y-8", "-translate-y-4", "translate-y-4"];

  // Enter-on-scroll variants — disabled entirely under reduced motion.
  const imageInitial = reduce
    ? { opacity: 1, x: 0 }
    : {
        opacity: 0,
        x: block.imagePosition === "left" ? -40 : 40,
      };
  const textInitial = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 };
  const enterEase = [0.16, 1, 0.3, 1] as const;

  return (
    <div
      className={`relative ${bg} ${text} py-24 lg:py-32 overflow-hidden`}
    >
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Image collage */}
        <motion.div
          initial={imageInitial}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: enterEase }}
          className={`order-2 ${block.imagePosition === "left" ? "lg:order-1" : "lg:order-2"}`}
        >
          <div
            className="grid grid-cols-2 gap-3 md:gap-4"
            role="group"
            aria-label="Галерея изображений"
          >
            {block.images.map((img, i) => (
              <div
                key={i}
                className={`gg-collage-cell relative ${
                  i % 2 === 0 ? "aspect-[3/4]" : "aspect-square"
                } ${tileOffsets[i] ?? "translate-y-0"}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Text column */}
        <motion.div
          initial={textInitial}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: enterEase }}
          className={`order-1 ${block.imagePosition === "left" ? "lg:order-2" : "lg:order-1"}`}
        >
          <p className={`gg-tagline ${eyebrowColor} mb-4`}>{block.eyebrow}</p>
          <h2
            className="gg-heading-two mb-6"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {block.heading}
          </h2>
          <div
            className="text-base md:text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {block.body}
          </div>
          {block.cta && (
            <a
              href={block.cta.href}
              className="gg-btn gg-btn-primary mt-8 inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gg-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-current"
            >
              {block.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

/**
 * GgFeatureCollage — three alternating Feature blocks stacked vertically.
 */
export function GgFeatureCollage() {
  return (
    <section
      id="gg-features"
      aria-label="Особенности, опыт и еда Interfood"
      className="relative w-full bg-white"
    >
      {FEATURES.map((f, i) => (
        <GgFeatureBlock key={i} block={f} />
      ))}
    </section>
  );
}

export default GgFeatureCollage;

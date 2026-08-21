"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * RisingPhotos — Concept-Catering.de "works" sticky-stacked photo section.
 *
 * Reverse-engineered from concept-catering.de:
 *   .works  { position: relative; height: N × 100vh }
 *   .project{ position: sticky; top: 0; height: 100vh; overflow: hidden }
 *
 * Because each .project is sticky at top:0 and the next comes after in DOM,
 * the next photo scrolls UP and COVERS the previous — the "rising photos"
 * effect. Pure CSS sticky stacking (no JS for the rise itself).
 *
 * Inside each project:
 *   - full-bleed next/image (fill, object-cover)
 *   - dark gradient overlay (legibility)
 *   - pink category label (top-left, Barlow Semi Condensed uppercase)
 *   - index marker (top-right)
 *   - bottom horizontal marquee of the service title 4×, pink • separators,
 *     animated via .cc-marquee-track (translateX -50%, seamless loop)
 *   - subtle parallax: image scale 1 → 0.92 + y 0 → -8% via framer-motion
 *     useScroll (only when !useReducedMotion())
 *
 * Reduced motion: marquee animation disabled (CSS @media query + JS gate),
 * parallax disabled. Sticky stack itself is layout, not motion — kept.
 */

type Service = {
  title: string;
  tagline: string;
  image: string;
  alt: string;
  href: string;
};

const SERVICES: Service[] = [
  {
    title: "Корпоративы",
    tagline: "Бизнес-завтраки · кофе-брейки · презентации",
    image: "/media/concorde-boardroom.webp",
    alt: "Корпоративный кейтеринг Interfood — бизнес-завтрак в конференц-зале с подачей на столах",
    href: "#services",
  },
  {
    title: "Свадьбы",
    tagline: "Ваш день · каждая деталь учтена",
    image: "/media/event-wedding-light.jpg",
    alt: "Свадебный кейтеринг Interfood — романтическая сервировка и тёплый свет на площадке",
    href: "#services",
  },
  {
    title: "Гриль и барбекю",
    tagline: "Живой огонь прямо на площадке",
    image: "/media/event-08.jpg",
    alt: "Гриль и барбекю от Interfood — живой огонь и подача прямо на площадке",
    href: "#services",
  },
  {
    title: "Фуршет",
    tagline: "Подносом и лотками · от 2450₽/чел",
    image: "/media/event-11.jpg",
    alt: "Фуршетный кейтеринг Interfood — подача подносом и лотками, от 2450₽/чел",
    href: "#services",
  },
];

/** One set = 4 titles separated by pink • dots. Rendered twice for seamless -50% loop. */
function MarqueeSet({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 pr-4 md:gap-8 md:pr-8" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex items-center gap-4 md:gap-8">
          <span className="text-white font-barlow font-extrabold uppercase leading-none text-[8vw] md:text-[7vw]">
            {title}
          </span>
          <span className="text-cc-pink text-[5vw] md:text-[4vw] leading-none">•</span>
        </span>
      ))}
    </div>
  );
}

function Project({ service, index, total }: { service: Service; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <article
      ref={ref}
      className="cc-project bg-cc-dark"
      aria-label={`${service.title} — ${service.tagline}`}
    >
      {/* Image with subtle parallax (scale + y) — only when motion allowed */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { scale, y }}
      >
        <Image
          src={service.image}
          alt={service.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      {/* Stronger bottom gradient toward cc-dark so the marquee text has contrast */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-cc-dark via-cc-dark/60 to-transparent" />

      {/* Category label (top-left) — top-32 on mobile to clear the taller
          mobile header (~125px), top-28 on desktop. text-shadow for legibility
          on light photo areas. */}
      <p className="absolute top-32 left-6 z-20 max-w-[70%] text-cc-pink font-barlow font-bold uppercase tracking-[0.2em] text-[11px] leading-relaxed [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] md:top-28 md:left-12 md:max-w-none md:text-base">
        {service.tagline}
      </p>

      {/* Index marker (top-right) */}
      <p className="absolute top-32 right-6 z-20 font-barlow text-xs font-medium uppercase tracking-wider text-white/90 [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] md:top-28 md:right-12 md:text-base">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      {/* "Подробнее →" CTA — outlined pill, above the marquee band.
          Mobile: left-6 bottom-[22vh] (avoids the right-side contact FAB stack).
          Desktop: right-12 bottom-[18vh]. bg-cc-dark/60 backdrop for legibility. */}
      <Link
        href={service.href}
        className="absolute left-6 bottom-[22vh] z-20 inline-flex items-center gap-2 rounded-full border border-cc-pink/70 bg-cc-dark/60 px-5 py-2.5 font-barlow text-xs font-semibold uppercase tracking-wider text-cc-pink backdrop-blur-md transition-colors duration-300 hover:bg-cc-pink hover:text-cc-dark md:left-auto md:right-12 md:bottom-[18vh] md:text-sm"
        aria-label={`Подробнее о направлении: ${service.title}`}
      >
        Подробнее
        <span aria-hidden="true">→</span>
      </Link>

      {/* Bottom marquee: 4× title + pink dots, duplicated for seamless -50% loop.
          Reduced-motion: single static centered set (CSS @media also kills anim). */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden">
        {/* Edge fade masks for cinematic "appearing from edges" feel.
            Narrower on mobile (w-10) so the marquee word stays readable. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-cc-dark to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-cc-dark to-transparent md:w-32" />

        {reduce ? (
          <div className="flex justify-center overflow-hidden pt-5 pb-12 md:pt-6 md:pb-14">
            <span className="text-white font-barlow text-[8vw] font-extrabold uppercase leading-none md:text-[7vw]">
              {service.title}
            </span>
          </div>
        ) : (
          <div className="cc-marquee-track pt-5 pb-12 md:pt-6 md:pb-14">
            <MarqueeSet title={service.title} />
            <MarqueeSet title={service.title} />
          </div>
        )}
      </div>
    </article>
  );
}

export function RisingPhotos() {
  const total = SERVICES.length;
  return (
    <section
      id="works"
      data-header-theme="dark"
      aria-label="Наши направления — примеры кейтеринга Interfood"
      className="relative bg-cc-dark"
      style={{ height: `${total * 100}vh` }}
    >
      <h2 className="sr-only">Наши направления</h2>
      {SERVICES.map((s, i) => (
        <Project key={s.title} service={s} index={i} total={total} />
      ))}
    </section>
  );
}

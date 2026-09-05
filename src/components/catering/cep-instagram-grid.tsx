"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Instagram, Play } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { CONTACTS } from "@/lib/config";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { ImageTrail } from "@/components/motion/image-trail";

/**
 * CepInstagramGrid — Creative Edge Parties §6.12 "FOLLOW ALONG" grid.
 *
 * Cream section with a header row ("СЛЕДИТЕ ЗА НАМИ" + @nilov_catering handle
 * link) and a 3×3 grid of 9 square Instagram thumbnails. 3 of the 9 (indices
 * 2, 5, 8 — the right column of each row) get a permanent but subtle Play
 * icon overlay to mimic CEP's Reel-play treatment on their actual Instagram
 * grid (CEP shows the icon always, not on hover).
 *
 * Each thumbnail links out to our Instagram profile. The hover state scales
 * the image up 5% (CEP's `.group-hover:scale-105` pattern, 700ms ease).
 *
 * Reveal on scroll via framer-motion staggered fade+slide (the global CEP
 * "Detailed / Fade / Slide / Ease" animation system, see analysis §6.1).
 * Respects `prefers-reduced-motion` — items snap to visible, no transform.
 *
 * Media (task 2-b): REAL photos of THIS business (the company behind
 * @nilov_catering — its own brand studio shoot, sourced from the company's
 * site interfood-catering.ru after Instagram itself proved unreachable for
 * anonymous scraping: profile page 429, web_profile_info 401, mirrors
 * imginn/picuki/dumpor blocked by Cloudflare/login walls). Tile alts are
 * honest literal descriptions verified by VLM (WM: НЕТ / PREMIUM: ДА).
 * No usable mp4s existed in any reachable source, so the Play overlay stays
 * a decorative (aria-hidden) Instagram-grid convention — alts describe
 * photos, not video.
 *
 * @see creativeedge-analysis.md §6.12 (Instagram grid)
 */
const IG_TILES = [
  {
    src: "/media/ig/ig-real-01.jpg",
    alt: "Мини-канапе с кремом, ягодами и фруктовым пюре на хрустящей основе, выложены в ряд на чёрной зеркальной поверхности",
  },
  {
    src: "/media/ig/ig-real-02.jpg",
    alt: "Канапе с копчёным лососем, сливочным сыром и красной икрой на декоративных шпажках на чёрном фоне",
  },
  {
    src: "/media/ig/ig-real-03.jpg",
    alt: "Канапе на шпажках с сыром, прошутто, клубникой и манго на чёрной отражающей поверхности",
  },
  {
    src: "/media/ig/ig-real-04.jpg",
    alt: "Порционные квадратные стаканчики с капрезе: помидоры черри на шпажках, шарики моцареллы и зелень",
  },
  {
    src: "/media/ig/ig-real-05.jpg",
    alt: "Ассорти фингер-фуда для фуршета: закуски с лососем, ветчиной и морепродуктами, выложенные рядами на чёрном фоне",
  },
  {
    src: "/media/ig/ig-real-06.jpg",
    alt: "Брускетты на хрустящем багете с кремовым сыром, запечёнными креветками и вялеными томатами",
  },
  {
    src: "/media/ig/ig-real-07.jpg",
    alt: "Открытые сэндвичи на багете со слабосолёным лососем, сливочным сыром, каперсами и лаймом",
  },
  {
    src: "/media/ig/ig-real-08.jpg",
    alt: "Три порционных стакана с салатами из морепродуктов, украшенными зеленью и дольками лимона, на зеркальной поверхности",
  },
  {
    src: "/media/ig/ig-real-09.jpg",
    alt: "Жареные креветки, томаты черри и грибы на деревянных шпажках, поданные на чёрной каменной тарелке с розмарином",
  },
] as const;

/** Indices that get the Reel Play-icon overlay (every 3rd, 0-based). */
const REEL_INDICES = new Set<number>([2, 5, 8]);

const IG_PROFILE_URL = "https://www.instagram.com/nilov_catering"; // C71: единый href без trailing slash (NIT A1#11)

export function CepInstagramGrid() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const shouldAnimate = mounted && !reduce;

  // Staggered container — children fade+slide in with 60ms stagger.
  // Task 5-C: tiles now also enter with a light alternating rotate
  // (±2°, «влетают с лёгким rotate и y-offset» — cascade reads as a wave
  // across the 3×3, especially on mobile where this reveal is the main
  // entrance moment). Variant functions receive the tile index via
  // `custom` — transform/opacity only, gated by shouldAnimate (reduce →
  // static, per the motion rules).
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldAnimate ? 0.06 : 0,
        delayChildren: shouldAnimate ? 0.05 : 0,
      },
    },
  };
  const itemVariants = {
    hidden: (i: number) =>
      shouldAnimate
        ? { opacity: 0, y: 24, rotate: i % 2 === 0 ? 1.5 : -1.5 }
        : { opacity: 1, y: 0, rotate: 0 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      aria-label="Мы в Instagram"
      data-header-theme="light"
      className="cep-section-cream w-full px-8 py-24 md:px-14 md:py-36"
    >
      {/* Header row — H2 + IG handle link */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        {/*
          Cycle 34 WOW graft — sondaven.com split-line word stagger. The H2
          "СЛЕДИТЕ ЗА НАМИ" reveals word-by-word (mask + translateY 110%→0%
          per word, 60ms stagger) instead of fading in as a block. Plain text —
          no italic-fragment design device here, so SplitTextReveal is safe.
          The cep-section-h2 + text-black styling is preserved via className.
        */}
        <SplitTextReveal
          as="h2"
          mode="words"
          className="cep-section-h2 text-black"
        >
          СЛЕДИТЕ ЗА НАМИ
        </SplitTextReveal>
        <a
          href={IG_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cep-nav-link inline-flex min-h-[44px] items-center gap-2 text-black transition-colors duration-300 hover:text-[var(--cep-red)]"
        >
          <Instagram className="size-5" aria-hidden="true" />
          <span>{CONTACTS.instagram}</span>
        </a>
      </div>

      {/* 3×3 grid of square thumbnails */}
      <motion.div
        className="grid grid-cols-3 gap-2 md:gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {IG_TILES.map((tile, i) => {
          const isReel = REEL_INDICES.has(i);
          return (
            <motion.a
              key={tile.src}
              href={IG_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram nilov catering — фото ${i + 1} из ленты (открывает профиль)`}
              /* C78: двойной тап — золотые искры (MicroDelights);
                  лейбл линзы курсора — аффорданс перехода. */
              data-spark
              data-cursor="Смотреть"
              className="group relative block aspect-square overflow-hidden bg-black/5"
              variants={itemVariants}
              custom={i}
            >
              {/*
                Cycle 34 WOW graft — sondaven.com staggered alternating
                directional clip-path reveal across the 3×3 grid. Each tile's
                image enters with a different clip direction (cycling
                [bottom, left, top, right] via index%4) and a 50ms-per-tile
                stagger so the grid reveals as a "shutter wave" sweeping
                across the 3×3, not a uniform wipe.

                The wrapper div inside ClipPathReveal carries `aspect-square`
                matching motion.a's aspect-square so next/image `fill`
                (position:absolute) has a definite containing block — the
                inner motion.div's height is auto, so this in-flow wrapper
                establishes it via aspect-ratio.

                The existing CSS hover scale (group-hover:scale-105, was
                transition-transform duration-700) is upgraded to also animate
                filter (saturate-150 brightness-105 on group-hover) for the
                Sondaven hover="card" multiply-wash feel — image deepens on
                hover. The Reel Play icon overlay stays outside the
                ClipPathReveal so it remains always-visible (CEP shows it
                always, not on hover).
              */}
              <ClipPathReveal
                direction="alternate"
                index={i}
                duration={0.7}
                delay={i * 0.05}
                className="absolute inset-0"
              >
                {/* Task 5-C hover: photo zoom (scale-[1.06]) is joined
                    by a card lift — the lift lives on THIS wrapper (not on
                    motion.a, whose transform belongs to framer entrance) and
                    is transform-only. motion-reduce keeps it static. */}
                <div className="relative aspect-square w-full transition-transform duration-500 ease-out group-hover:-translate-y-1.5 motion-reduce:transform-none motion-reduce:transition-none">
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    /* 81-W2F2 (E MAJOR, критик E волна-2): было 33vw/22vw —
                       сетка 3×3 реально рендерит тайл (100vw − паддинги −
                       гэпы)/3 = 434.7px @1440 (замер), а sizes декларировал
                       316.8px → браузер брал вариант 384 → апскейл 0.88×
                       даже на DPR1 и 0.74× на retina. calc() из реального
                       лэйаута: <768 — px-8(32×2)+gap-2(8×2); ≥768 —
                       px-14(56×2)+md:gap-3(12×2). Теперь: DPR1 1440 →
                       кандидат 640 (1.47×), DPR2 → 1080 (файл 1024 =
                       1.18× retina), мобайл DPR2 → 256 (1.24×). Источники
                       1024×1024 — лимит натурального разрешения соблюдён. */
                    sizes="(max-width: 767px) calc((100vw - 80px) / 3), calc((100vw - 136px) / 3)"
                    /* food-крупняки: +q82 против webp-«каши» на деталях
                       текстуры (байтовая дельта ~40% от q75, приемлемо
                       для витринной сетки) */
                    quality={82}
                    className="object-cover transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.06] group-hover:saturate-150 group-hover:brightness-105 motion-reduce:transform-none motion-reduce:transition-[filter]"
                  />
                </div>
              </ClipPathReveal>

              {/* Task 5-C hover: gold frame fades in around the tile
                  (opacity 0→1 only — no layout, no paint-heavy filter). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 border-2 border-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              {/* C83 (Impl-E, Task 3): caption slide-up fallback — captions
                  в разметке нет → тонкий золотой hairline по низу тайла
                  «прорисовывается» (scaleX 0→1, origin-left), ложась ровно
                  на нижнюю кромку золотой рамки: свип идёт в такт её
                  fade-in, конечное состояние бесшовно сливается с рамкой.
                  Fine-pointer гейт — Tailwind media-вариант (hover:hover +
                  pointer:fine), touch-тайлы линию не получают; reduce —
                  transition-none (мгновенное состояние, без анимации).
                  Transform-only, pointer-events-none — ImageTrail /
                  data-spark / data-tilt / ClipPathReveal не затронуты. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-x-100"
              />

              {/* Reel Play icon — always visible but subtle (CEP shows it always) */}
              {isReel && (
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-white/90 shadow-md shadow-black/20">
                    <Play
                      className="ml-0.5 size-5 fill-black text-black"
                      strokeWidth={1.5}
                    />
                  </span>
                </span>
              )}
            </motion.a>
          );
        })}
      </motion.div>

      {/* Волна 1 / Task 1-c2: ImageTrail — ГЛАВНЫЙ мобильный вау секции.
          Свайп/скролл пальцем (или движение мыши) по секции оставляет
          шлейф карточек-«искр» с фото блюд (позиция гейтится rect-ом этой
          секции). Слой fixed на body, pointer-events:none — клики по
          плиткам и нативный скролл не затрагиваются. reduce-motion —
          компонент пассивен. */}
      <ImageTrail />
    </section>
  );
}

export default CepInstagramGrid;

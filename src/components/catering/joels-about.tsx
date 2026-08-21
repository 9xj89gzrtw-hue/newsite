"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StackedParallaxImages } from "./stacked-parallax-images";
import { TextualLink } from "./textual-link";

/**
 * JoelsAbout — joels.com About section as a parallel editorial section.
 *
 * Adds the joels.com stacked-parallax wow moment to the page WITHOUT
 * replacing the existing About component (which has 3D-tilt StatCards).
 *
 * Layout (per docs/JOELS-ANALYSIS.md §9 P2.1 + §13 about section):
 *   - 2-column split (lg:grid-cols-12)
 *   - left 4/12  = StackedParallaxImages (main landscape + stacked portrait)
 *   - right 7/12 = text column (offset by 1 col on lg for breathing room)
 *
 * Right column:
 *   - Eyebrow "О НАС" — sage, 11px, 0.4em tracking
 *   - 50px Playfair headline "Искусство вкуса с 2014 года" (ink, lh 1.1)
 *   - Body paragraph (15px, ink/70) — 2-3 sentences about chef-driven catering
 *   - <TextualLink href="#about">КТО МЫ</TextualLink>
 *
 * Background: cream. Wrapper: max-w-[1070px] (joels content frame).
 * Stagger reveal via framer-motion + reduced-motion respected.
 *
 * Source: docs/JOELS-ANALYSIS.md §9 P2.1, §10.4, §13 about-section.
 *
 * Image selection: using existing catering photos from /public/media:
 *   - main (landscape): /media/ridgewells-gala.jpg (gala table setting, 1000×764)
 *   - stacked (portrait): /media/event-wedding-light.jpg (wedding scene, portrait)
 */
export function JoelsAbout() {
  const reduce = useReducedMotion();

  return (
    <section
      id="joels-about"
      aria-labelledby="joels-about-headline"
      className="bg-cream py-24 md:py-32"
    >
      <div className="joel-content-frame">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left — stacked parallax images (4/12 on lg) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              <StackedParallaxImages
                mainSrc="/media/ridgewells-gala.jpg"
                mainAlt="Оформление премиального банкета — Interfood Catering"
                stackedSrc="/media/event-wedding-light.jpg"
                stackedAlt="Свадебный банкет под открытым небом — Interfood Catering"
              />
            </motion.div>
          </div>

          {/* Right — text column (7/12 on lg, offset 0) */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="joel-eyebrow"
            >
              О нас
            </motion.p>

            <motion.h2
              id="joels-about-headline"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="joel-section-title mt-3 max-w-[520px]"
            >
              Искусство вкуса с 2014 года
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="mt-6 max-w-[520px] font-sans text-[15px] leading-[1.7] text-ink/70"
            >
              Interfood Catering — это команда шеф-поваров, сомелье и
              официантов, объединённых одним принципом: каждое блюдо должно
              стать произведением искусства. Мы готовим из сезонных продуктов,
              сервируем под концепцию события и сопровождаем мероприятие от
              первой канапе до последнего тоста.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: 0.45,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="mt-10"
            >
              <TextualLink href="#about" tone="ink">
                Кто мы
              </TextualLink>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoelsAbout;

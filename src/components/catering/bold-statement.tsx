import Link from "next/link";
import { Reveal } from "@/components/catering/reveal";

/**
 * BoldStatement — Concept-Catering.de "section-no-padding" dark editorial
 * statement. Massive ultra-bold condensed all-caps headline (Barlow Semi
 * Condensed 800), one word highlighted in pink, subtext + two CTAs.
 *
 * Reveal wraps each block for staggered scroll-into-view entrance (the Reveal
 * component already respects prefers-reduced-motion — falls back to static).
 */

export function BoldStatement() {
  return (
    <section
      data-header-theme="dark"
      aria-label="О кейтеринге Interfood"
      className="bg-cc-dark px-6 py-24 text-white md:py-40"
    >
      <div className="mx-auto max-w-screen-2xl">
        <Reveal>
          <p className="mb-8 font-barlow text-xs font-bold uppercase tracking-[0.3em] text-cc-pink md:text-sm">
            Interfood Catering · Санкт-Петербург
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-barlow text-[12vw] font-extrabold uppercase leading-[0.9] md:text-[8vw]">
            <span className="block">Невероятно</span>
            <span className="block text-cc-pink">вкусный</span>
            <span className="block">кейтеринг</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-2 md:items-end">
          <Reveal delay={0.2}>
            <p className="max-w-2xl text-lg text-white/70 md:text-xl">
              «Еда как искусство» — выездной кейтеринг полного цикла в Санкт-Петербурге.
              Фуршеты, банкеты, кофе-брейки и живой гриль от 2450₽/чел.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-full bg-cc-pink px-7 py-3.5 font-barlow text-sm font-bold uppercase tracking-wider text-cc-dark transition-colors duration-300 hover:bg-cc-pink-soft"
              >
                Рассчитать стоимость
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="#menu"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-barlow text-sm font-bold uppercase tracking-wider text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-cc-dark"
              >
                Смотреть меню
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

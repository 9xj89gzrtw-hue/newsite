"use client";

import { Reveal } from "./reveal";
import { Flower2, ArrowRight, Sparkles } from "lucide-react";

/**
 * Promo banner — LIGHT THEME
 * Акция «Флористика в подарок» при заказе свадебного банкета/фуршета.
 */
export function PromoBanner() {
  const currentYear = new Date().getFullYear();
  return (
    <section data-header-theme="dark" className="relative overflow-hidden bg-gradient-to-r from-gold via-terracotta to-gold py-16 md:py-24">
      {/* Decorative flowers */}
      <div className="pointer-events-none absolute -right-10 -top-10 opacity-20">
        <Flower2 className="size-64 text-white" />
      </div>
      <div className="pointer-events-none absolute -bottom-10 -left-10 opacity-20 rotate-180">
        <Flower2 className="size-64 text-white" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:gap-12 md:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-white backdrop-blur-sm">
              <Sparkles className="size-3" aria-hidden="true" />
              <span>Акция · сезон {currentYear}</span>
            </span>
          </Reveal>
          <div className="flex-1">
            <Reveal delay={0.1}>
              <h2
                className="font-display text-white"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.1 }}
              >
                Флористика в подарок{"\u00A0"}при заказе свадьбы
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-2xl text-base text-white/90">
                При заказе свадебного банкета или фуршета дарим до 4 цветочных
                композиций в вазах на столы гостей или композицию на стол
                молодожёнов. Сезон свадебных торжеств уже близко.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <a
              href="#calculator"
              data-cursor="считать"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wider text-gold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] min-h-[44px]"
            >
              Рассчитать свадьбу
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

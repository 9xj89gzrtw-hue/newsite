"use client";

import { Reveal } from "./reveal";
import { Flower2, ArrowRight, Sparkles } from "lucide-react";

/**
 * Промо-баннер — LIGHT THEME
 * Сезонные свадебные меню 2026 — смотреть меню.
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
              <span>Промо · Зима {currentYear}</span>
            </span>
          </Reveal>
          <div className="flex-1">
            <Reveal delay={0.1}>
              <h2
                className="font-display text-white"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.1 }}
              >
                Сезонные свадебные меню 2026{"\u00A0"}
                <span className="block md:inline">— смотреть меню →</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-2xl text-base text-white/90">
                Томёная грудинка, пюре из корнеплодов, зимняя зелень и свежий хлеб.
                Сезонные меню от наших шеф-поваров — идеально для корпоративных встреч,
                новогодних праздников и зимних торжеств.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <a
              href="#winter-specials"
              data-cursor="view"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wider text-gold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] min-h-[44px]"
            >
              Смотреть спецпредложения
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

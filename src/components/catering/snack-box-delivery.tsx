"use client";

import { motion } from "framer-motion";
import { Truck, ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";
import { SNACK_BOX_ITEMS } from "@/lib/media";
import { formatRUB } from "@/lib/pricing";

/**
 * SnackBoxDelivery — LIGHT THEME
 * 
 * Доставка закусок — отдельная услуга (мобильный фуршет в коробках).
 */
export function SnackBoxDelivery() {
  return (
    <section id="snack-box" className="relative overflow-hidden bg-cream-2 py-24 md:py-36">
      {/* Decoration */}
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-gold/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-16">
          {/* Left: intro */}
          <div className="md:sticky md:top-24 md:self-start">
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                <Truck className="size-3" />
                Доставка закусок
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
              >
                Мобильный фуршет{" "}
                <br className="hidden sm:block" />
                <span className="gradient-text italic">в индивидуальной упаковке</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/60 font-display">
                Готовые наборы закусок для мероприятий любого формата — канапе,
                брускетты, салаты, горячее. Индивидуальная упаковка, удобная
                подача. Доставка по Санкт-Петербургу.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-6 flex items-center gap-3 text-sm text-ink/60 bg-white/70 inline-flex px-4 py-2 rounded-full">
                <Truck className="size-5 text-gold" />
                <span>Доставка по СПб · от 10 порций · от 1 дня</span>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <a
                href="#contact"
                data-cursor="заказать"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Заказать доставку
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>
          </div>

          {/* Right: price list */}
          <div>
            <Reveal>
              <div className="overflow-hidden rounded-2xl border border-border-line bg-white shadow-lg shadow-ink/5">
                <div className="flex items-center justify-between bg-gradient-to-r from-gold to-terracotta px-6 py-4">
                  <h3 className="font-display text-lg text-white">Прайс-лист</h3>
                  <span className="font-mono text-xs uppercase tracking-wider text-white/80">
                    {SNACK_BOX_ITEMS.length} позиций
                  </span>
                </div>
                <ul className="divide-y divide-border-line bg-cream/50">
                  {SNACK_BOX_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-ink/40 w-6">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm md:text-base text-ink/80">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-sm font-semibold gradient-text">
                          {formatRUB(item.price)}
                        </span>
                        <span className="font-mono text-xs text-ink/40 hidden sm:inline">
                          / {item.unit}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <div className="bg-parchment/50 px-6 py-3 text-center font-mono text-xs text-ink/40">
                  * Минимальный заказ — от 10 порций. Финальная стоимость зависит от объёма и логистики.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

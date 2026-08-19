"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Truck, ArrowUpRight, Minus, Plus } from "lucide-react";
import { Reveal } from "./reveal";
import { SnackBoxCube3D } from "./snack-box-3d-cube";
import { SNACK_BOX_ITEMS } from "@/lib/media";
import { formatRUB } from "@/lib/pricing";

/**
 * SnackBoxDelivery — LIGHT THEME
 *
 * Доставка закусок — отдельная услуга (мобильный фуршет в коробках).
 *
 * Task 2-c additions:
 *  - Inline qty stepper (`- 1 +`) per row, opens via AnimatePresence.
 *    Plus/minus buttons have whileTap scale.
 *  - Running total pill (sticky) in the price-list card footer that
 *    shows `Σ N порций · X₽` and pulses on qty change.
 */
export function SnackBoxDelivery() {
  const prefersReducedMotion = useReducedMotion();
  // qty state per item name → number
  const [qty, setQty] = useState<Record<string, number>>({});
  // Track which row's stepper is currently visible (only one row expanded at a time
  // feels less noisy; toggle on click of "+" button OR row body).
  const [openRow, setOpenRow] = useState<string | null>(null);

  const setQtyFor = (name: string, next: number) => {
    setQty((prev) => {
      const clamped = Math.max(0, next);
      const updated = { ...prev, [name]: clamped };
      return updated;
    });
  };

  const increment = (name: string) => {
    setQtyFor(name, (qty[name] ?? 0) + 1);
  };
  const decrement = (name: string) => {
    setQtyFor(name, (qty[name] ?? 0) - 1);
  };

  // Totals — sum across all rows
  const { totalPortions, totalRub } = useMemo(() => {
    let portions = 0;
    let rub = 0;
    for (const item of SNACK_BOX_ITEMS) {
      const n = qty[item.name] ?? 0;
      if (n > 0) {
        portions += n;
        rub += n * item.price;
      }
    }
    return { totalPortions: portions, totalRub: rub };
  }, [qty]);

  const hasAny = totalPortions > 0;

  return (
    <section
      id="snack-box"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-cream-2 py-24 md:py-36"
    >
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
                className="group mt-8 inline-flex items-center gap-2 rounded-full cta-gradient-punchy bg-gradient-to-r from-gold to-terracotta px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Заказать доставку
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>

            {/* Phase 8 P2 wow-factor: 3D-rotating cube mockup
                6 cube faces use 6 real catering photos from reference sites
                (concorde handhelds/scallops/avo-toast/veg-mosaic/dessert/banquet-table).
                Auto-rotates 360° over 24s; half-speed on hover; static for reduced-motion. */}
            <Reveal delay={0.5}>
              <div className="mt-10">
                <SnackBoxCube3D />
              </div>
            </Reveal>
          </div>

          {/* Right: price list with sticky running-total badge */}
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-border-line bg-white shadow-lg shadow-ink/5">
              <div className="relative flex items-center justify-between bg-gradient-to-r from-gold to-terracotta px-6 py-4">
                <h3 className="font-display text-lg text-white">Прайс-лист</h3>
                <span className="font-mono text-xs uppercase tracking-wider text-white/80">
                  {SNACK_BOX_ITEMS.length} позиций
                </span>

                {/* Sticky running-total pill — pulses on qty change */}
                <AnimatePresence>
                  {hasAny && (
                    <motion.div
                      key="running-total"
                      initial={{ opacity: 0, scale: 0.85, x: 12 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.85, x: 12 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-3 -bottom-3 sm:static sm:translate-x-0"
                    >
                      <motion.span
                        key={`${totalPortions}-${totalRub}`}
                        initial={prefersReducedMotion ? false : { scale: 1 }}
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { scale: [1, 1.05, 1] }
                        }
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 font-mono text-xs font-semibold text-cream shadow-lg shadow-ink/30"
                      >
                        <span aria-hidden="true">Σ</span>
                        <span className="tabular-nums">{totalPortions}</span>
                        <span className="text-cream/60">порций</span>
                        <span aria-hidden="true" className="text-cream/40">·</span>
                        <span className="tabular-nums">{formatRUB(totalRub)}</span>
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ul className="divide-y divide-border-line bg-cream/50">
                {SNACK_BOX_ITEMS.map((item, i) => {
                  const n = qty[item.name] ?? 0;
                  const isOpen = openRow === item.name || n > 0;
                  return (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="group relative px-6 py-4 transition-colors hover:bg-white"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenRow((cur) => (cur === item.name ? null : item.name))
                          }
                          className="flex flex-1 items-center gap-3 text-left min-h-[44px]"
                          aria-expanded={isOpen}
                          aria-controls={`stepper-${i}`}
                          aria-label={`${item.name}, добавить в заказ`}
                        >
                          <span className="font-mono text-xs text-ink/70 w-6 shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm md:text-base text-ink/80 group-hover:text-ink transition-colors">
                            {item.name}
                          </span>
                        </button>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Price */}
                          <span className="font-mono text-sm font-semibold gradient-text tabular-nums">
                            {formatRUB(item.price)}
                          </span>
                          <span className="font-mono text-xs text-ink/70 hidden sm:inline">
                            / {item.unit}
                          </span>

                          {/* Inline qty stepper */}
                          <div
                            id={`stepper-${i}`}
                            className="flex items-center"
                          >
                            <AnimatePresence mode="popLayout" initial={false}>
                              {isOpen ? (
                                <motion.div
                                  key="stepper"
                                  layout
                                  initial={{
                                    opacity: 0,
                                    scale: prefersReducedMotion ? 1 : 0.9,
                                    width: 0,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                    width: "auto",
                                  }}
                                  exit={{
                                    opacity: 0,
                                    scale: prefersReducedMotion ? 1 : 0.9,
                                    width: 0,
                                  }}
                                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                  className="flex items-center gap-1 overflow-hidden"
                                >
                                  <motion.button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      decrement(item.name);
                                    }}
                                    disabled={n === 0}
                                    aria-label={`Уменьшить: ${item.name}`}
                                    className="flex size-11 items-center justify-center rounded-full border border-border-line bg-white text-ink/70 transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
                                    whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                                  >
                                    <Minus className="size-3.5" />
                                  </motion.button>
                                  <motion.span
                                    key={n}
                                    initial={
                                      prefersReducedMotion
                                        ? false
                                        : { scale: 0.6, opacity: 0 }
                                    }
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.18 }}
                                    className="min-w-[2ch] text-center font-mono text-sm font-bold text-ink tabular-nums"
                                  >
                                    {n}
                                  </motion.span>
                                  <motion.button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      increment(item.name);
                                    }}
                                    aria-label={`Увеличить: ${item.name}`}
                                    className="flex size-11 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-sm shadow-gold/25 transition-transform hover:scale-105 min-h-[44px] min-w-[44px]"
                                    whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                                  >
                                    <Plus className="size-3.5" />
                                  </motion.button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="add"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenRow(item.name);
                                    increment(item.name);
                                  }}
                                  aria-label={`Добавить: ${item.name}`}
                                  className="flex size-11 items-center justify-center rounded-full border border-border-line bg-white text-ink/70 transition-colors hover:border-gold/40 hover:text-gold hover:bg-gold/5 min-h-[44px] min-w-[44px]"
                                  whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.18 }}
                                >
                                  <Plus className="size-3.5" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Row subtotal badge when n > 0 */}
                      <AnimatePresence>
                        {n > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 flex items-center justify-between rounded-lg bg-gold/8 px-3 py-2 text-xs text-ink/65">
                              <span>
                                В заказе: <span className="font-semibold text-ink">{n} × {formatRUB(item.price)}</span>
                              </span>
                              <span className="font-mono font-semibold text-gold">
                                = {formatRUB(n * item.price)}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Footer: running total + reset + checkout CTA */}
              <div className="border-t border-border-line bg-parchment/50 px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-ink/70">
                    * Мин. заказ — от 10 порций. Финальная стоимость зависит от объёма.
                  </div>
                  <div className="flex items-center gap-3">
                    {hasAny && (
                      <button
                        type="button"
                        onClick={() => {
                          setQty({});
                          setOpenRow(null);
                        }}
                        className="rounded-full px-3 py-2.5 text-xs font-medium text-ink/70 transition-colors hover:text-bordeaux hover:underline min-h-[44px]"
                      >
                        Сбросить
                      </button>
                    )}
                    <a
                      href="#contact"
                      data-cursor="оформить"
                      aria-disabled={!hasAny}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold shadow-lg transition-all ${
                        hasAny
                          ? "bg-gradient-to-r from-gold to-terracotta text-white shadow-gold/25 hover:shadow-xl hover:-translate-y-0.5"
                          : "cursor-not-allowed bg-ink/10 text-ink/70 shadow-none"
                      }`}
                    >
                      Оформить: {formatRUB(totalRub)}
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

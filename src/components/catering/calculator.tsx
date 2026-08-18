"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { motion, useMotionValue, animate } from "framer-motion";
import { Minus, Plus, Check, Sparkles, Share2 } from "lucide-react";
import { Reveal } from "./reveal";
import {
  MENU_TYPES, ADDONS, calcTotal, formatRUB, seasonMultiplier,
} from "@/lib/pricing";

/**
 * Calculator — LIGHT THEME with elegant card styling
 * 
 * Inspired by Wolfgang Puck:
 * - Clean white cards
 * - Gold accent for selected items
 * - Animated total counter
 * - Sticky result panel
 */
export function Calculator() {
  // nuqs: typeId + guests are shareable via URL (?type=banquet&guests=60).
  const [typeId, setTypeId] = useQueryState(
    "type",
    parseAsString.withDefault("banquet"),
  );
  const [guests, setGuests] = useQueryState(
    "guests",
    parseAsInteger.withDefault(60),
  );
  const [addons, setAddons] = useState<string[]>(["equipment", "decor"]);
  const [date, setDate] = useState("");
  const [copied, setCopied] = useState(false);

  // Listen for menu selection events (from #menu section clicks)
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (MENU_TYPES.some((m) => m.id === id)) setTypeId(id);
    };
    window.addEventListener("catering:menu-select", handler);
    return () => window.removeEventListener("catering:menu-select", handler);
  }, [setTypeId]);

  const result = calcTotal(typeId, guests, addons, date);
  const current = MENU_TYPES.find((m) => m.id === typeId) ?? MENU_TYPES[0];
  const guestsClamped = Math.max(guests, current.minGuests);

  // Animated total
  const mv = useMotionValue(result.total);
  const [display, setDisplay] = useState(formatRUB(result.total));

  useEffect(() => {
    const controls = animate(mv, result.total, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(formatRUB(Math.round(v))),
    });
    return () => controls.stop();
  }, [result.total, mv]);

  // Share current calculator config as URL
  const shareLink = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/?type=${typeId}&guests=${guests}#calculator`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.hash = "calculator";
    }
  };

  const toggleAddon = (id: string) =>
    setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  return (
    <section id="calculator" className="relative overflow-hidden bg-cream py-24 md:py-36">
      {/* Subtle glow effect */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <Sparkles className="size-3" />
              Калькулятор
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(1.9rem, 5.5vw, 3.75rem)", lineHeight: 1.05 }}
            >
              Рассчитайте стоимость{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text italic">за полминуты</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-lg text-base text-ink/60">
              Предварительная оценка. Точная смета — после короткой консультации.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Inputs — white card */}
          <Reveal className="rounded-2xl border border-border-line bg-white p-6 shadow-lg shadow-ink/5 md:p-8">
            {/* Type selector */}
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-ink/60 font-medium">
                1. Тип мероприятия
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {MENU_TYPES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setTypeId(m.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      typeId === m.id
                        ? "bg-gradient-to-r from-gold to-terracotta text-white shadow-md shadow-gold/25"
                        : "border border-border-line bg-cream/50 text-ink/70 hover:border-gold hover:bg-gold/5"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guests slider */}
            <div className="mt-8">
              <label className="font-mono text-xs uppercase tracking-wider text-ink/60 font-medium">
                2. Гостей:{" "}
                <span className="text-ink font-semibold">{guests}</span>
                {guests < current.minGuests && (
                  <span className="ml-2 text-gold">мин. {current.minGuests}</span>
                )}
              </label>
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={() => setGuests((g) => Math.max(5, g - 5))}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-line bg-cream/50 text-ink hover:border-gold hover:bg-gold/10 transition-colors"
                  aria-label="Меньше"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  aria-valuenow={guests}
                  aria-valuemin={5}
                  aria-valuemax={500}
                  aria-label={`Количество гостей: ${guests}`}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-cream accent-gold [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                />
                <button
                  onClick={() => setGuests((g) => Math.min(500, g + 5))}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-line bg-cream/50 text-ink hover:border-gold hover:bg-gold/10 transition-colors"
                  aria-label="Больше"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Addons */}
            <div className="mt-8">
              <label className="font-mono text-xs uppercase tracking-wider text-ink/60 font-medium">
                3. Доп. услуги
              </label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const on = addons.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a.id)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        on
                          ? "border-gold bg-gold/10 text-ink shadow-sm"
                          : "border-border-line bg-cream/30 text-ink/70 hover:border-gold/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
                            on ? "border-gold bg-gradient-to-r from-gold to-terracotta text-white" : "border-border-line"
                          }`}
                        >
                          {on && <Check className="size-3" />}
                        </span>
                        {a.label}
                      </span>
                      <span className="font-mono text-xs text-ink/50">
                        +{formatRUB(a.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date picker */}
            <div className="mt-8">
              <label htmlFor="calc-date" className="font-mono text-xs uppercase tracking-wider text-ink/60 font-medium">
                4. Дата (необязательно)
              </label>
              <input
                type="date"
                id="calc-date"
                name="eventDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Дата мероприятия (необязательно)"
                className="mt-3 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3 text-ink outline-none focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition-all"
              />
              {date && seasonMultiplier(date) > 1 && (
                <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-terracotta">
                  <Sparkles className="size-3" />
                  Сезонный спрос: +15%
                </p>
              )}
            </div>
          </Reveal>

          {/* Result panel — sticky */}
          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-white to-cream p-6 shadow-xl shadow-gold/5 md:p-8 lg:sticky lg:top-24">
              <span className="font-mono text-xs uppercase tracking-wider text-ink/50 font-medium">
                Предварительная смета
              </span>

              <div className="mt-4">
                <div className="font-display gradient-text" style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.5rem)", lineHeight: 1 }}>
                  {display}
                </div>
                <p className="mt-2 text-base text-ink/50">
                  ~ {formatRUB(Math.round(result.total / guestsClamped))} / гость · {guestsClamped} гостей
                </p>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-border-line pt-5 text-sm">
                <Row label={current.label} value={`${formatRUB(result.perGuest)} × ${guestsClamped}`} />
                <Row label="Подытог" value={formatRUB(result.subtotal)} />
                {result.addonsTotal > 0 && (
                  <Row label="Доп. услуги" value={formatRUB(result.addonsTotal)} />
                )}
                {result.season > 1 && (
                  <Row label="Сезон +15%" value={`×${result.season}`} />
                )}
              </div>

              <a
                href="#contact"
                data-cursor="заявка"
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Оставить заявку с этой сметой
                <Share2 className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <button
                onClick={shareLink}
                data-cursor="ссылка"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border-line px-5 py-3 text-xs font-medium uppercase tracking-wider text-ink/60 hover:border-gold hover:text-gold transition-colors"
              >
                <Share2 className="size-3.5" />
                {copied ? "✓ Ссылка скопирована!" : "Поделиться сметой"}
              </button>

              <p className="mt-3 text-center font-mono text-xs text-ink/40">
                * Предварительная оценка. Финальная стоимость — после консультации.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Row component for the breakdown */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-ink/60">{label}</span>
      <span className="font-mono font-medium text-ink">{value}</span>
    </div>
  );
}

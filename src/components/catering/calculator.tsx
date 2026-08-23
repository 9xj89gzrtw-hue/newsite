"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Check,
  Sparkles,
  Share2,
  UtensilsCrossed,
  Wine,
  Package,
  Coffee,
  Leaf,
  Flame,
  Building2,
  Settings,
  Palette,
  CakeSlice,
  GlassWater,
  Droplets,
  FileSignature,
  TrendingUp,
  Send as TelegramIcon,
  MessageCircle,
  Gift,
} from "lucide-react";
import { Reveal } from "./reveal";
import { Magnetic } from "@/components/motion/magnetic";
import {
  MENU_TYPES, ADDONS, calcTotal, formatRUB, seasonMultiplier,
} from "@/lib/pricing";

/* ───────── Event type icon mapping ───────── */
const TYPE_ICONS: Record<string, React.ElementType> = {
  banquet: UtensilsCrossed,
  buffet: Wine,
  "snack-box": Package,
  "coffee-break": Coffee,
  vegetarian: Leaf,
  bbq: Flame,
  "office-lunch": Building2,
};

const TYPE_EMOJIS: Record<string, string> = {
  banquet: "🍽️",
  buffet: "🥂",
  "snack-box": "📦",
  "coffee-break": "☕",
  vegetarian: "🥗",
  bbq: "🔥",
  "office-lunch": "🏢",
};

/* ───────── Addon icon mapping ───────── */
const ADDON_ICONS: Record<string, React.ElementType> = {
  equipment: Settings,
  decor: Palette,
  cake: CakeSlice,
  champagne: GlassWater,
  fountain: Droplets,
  registration: FileSignature,
};

/* ───────── Slider tick marks ───────── */
const SLIDER_TICKS = [25, 50, 100, 200, 500];

/**
 * Calculator — PREMIUM UI/UX with elegant animations
 *
 * Inspired by culinarycanvasstl.com, calconic.com, thecateringfinder.com
 * - Visual event type cards with icons & glow animation
 * - Enhanced slider with ticks, bubble & gold gradient fill
 * - Addon cards with lucide icons & animated toggles
 * - Result panel with pulse animation & staggered breakdown
 * - Mobile-optimized touch interactions
 */
export function Calculator() {
  // nuqs: typeId + guests are shareable via URL (?type=banquet&guests=60).
  const [typeId, setTypeId] = useQueryState(
    "type",
    parseAsString.withDefault("buffet"),
  );
  const [guests, setGuests] = useQueryState(
    "guests",
    parseAsInteger.withDefault(50),
  );
  // Cycle 38 fix: paid addons are NO LONGER pre-selected — the first price
  // a visitor sees is the honest base for the selected format (previously
  // +40 000 ₽ of addons was silently baked in, inflating the first quote 15%).
  const [addons, setAddons] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Track previous total for animation trigger
  const [prevTotal, setPrevTotal] = useState(0);
  const [totalChanged, setTotalChanged] = useState(false);

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

  // Cycle 38 fix: clamp guests to the format minimum whenever the type
  // changes (or a too-low guests= value arrives via URL) — slider, estimate
  // and share link now always agree on the same number.
  useEffect(() => {
    if (guests < current.minGuests) setGuests(current.minGuests);
  }, [current.minGuests, guests, setGuests]);

  // Animated total
  const mv = useMotionValue(result.total);
  const [display, setDisplay] = useState(formatRUB(result.total));

  // Detect total change for pulse animation
  useEffect(() => {
    if (prevTotal !== 0 && prevTotal !== result.total) {
      setTotalChanged(true);
      const timer = setTimeout(() => setTotalChanged(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevTotal(result.total);
  }, [result.total, prevTotal]);

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
    const url = `${window.location.origin}/?type=${typeId}&guests=${guestsClamped}#calculator`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.hash = "calculator";
    }
  };

  // Build shareable URLs for Telegram + WhatsApp.
  // CRITICAL: compute in state set by useEffect (NOT inline during render) —
  // window.location.origin differs between SSR (undefined → "") and client,
  // which caused a hydration mismatch on the <a href> that broke hydration for
  // the WHOLE page (preventing all client effects, incl. Embla carousels, from
  // running). Server + first client render now both get "" → match → hydrate.
  const shareText = `Расчёт кейтеринга: ${formatRUB(result.total)} — ${current.label}, ${guestsClamped} гостей. Подробности:`;
  const [shareUrls, setShareUrls] = useState({ telegram: "", whatsapp: "" });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enc = encodeURIComponent(
      `${window.location.origin}/?type=${typeId}&guests=${guestsClamped}#calculator`,
    );
    setShareUrls({
      telegram: `https://t.me/share/url?url=${enc}&text=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `${shareText} ${decodeURIComponent(enc)}`,
      )}`,
    });
  }, [typeId, guestsClamped, shareText]);
  const telegramShareUrl = shareUrls.telegram;
  const whatsappShareUrl = shareUrls.whatsapp;

  const toggleAddon = useCallback((id: string) =>
    setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id])),
  []);

  // Calculate per-person price range for display
  const perPersonMin = current.perGuest;
  const perPersonMax = current.packages[current.packages.length - 1]?.pricePerGuest || current.perGuest;

  return (
    <section id="calculator" data-header-theme="light" className="section-light relative overflow-hidden bg-cream py-24 md:py-36">
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
              <span className="gradient-text italic">за 30 секунд</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-lg text-base text-ink/70">
              Предварительная оценка. Итоговая стоимость — после короткой консультации.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Inputs — white card */}
          <Reveal className="rounded-2xl border border-border-line bg-white p-6 shadow-lg shadow-ink/5 md:p-8">
            {/* ═══ Type selector — Visual Cards ═══ */}
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-ink/70 font-medium flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-gold/10 text-gold text-[11px] font-bold">1</span>
                Тип мероприятия
              </label>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MENU_TYPES.map((m) => {
                  const IconComponent = TYPE_ICONS[m.id];
                  const isSelected = typeId === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => setTypeId(m.id)}
                      aria-pressed={isSelected}
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.02 }}
                      className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 ${
                        isSelected
                          ? "border-gold bg-gradient-to-br from-gold/10 to-terracotta/10 shadow-lg shadow-gold/20"
                          : "border-border-line bg-cream/30 hover:border-gold/40 hover:bg-gold/5"
                      }`}
                    >
                      {/* Glow effect when selected */}
                      {isSelected && (
                        <motion.div
                          layoutId="type-glow"
                          className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/20 to-transparent opacity-50"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                        />
                      )}
                      
                      {/* Icon container */}
                      <div className={`relative flex size-12 items-center justify-center rounded-xl transition-all duration-300 ${
                        isSelected 
                          ? "bg-gradient-to-br from-gold to-terracotta text-white shadow-md" 
                          : "bg-white text-ink/70 group-hover:text-gold group-hover:bg-gold/10"
                      }`}>
                        {IconComponent && <IconComponent className="size-5" />}
                        {/* Pulse ring on selected */}
                        {isSelected && (
                          <motion.span
                            className="absolute inset-0 rounded-xl border-2 border-gold"
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.15, opacity: 0 }}
                            transition={{ repeat: Infinity, repeatDelay: 1.5, duration: 1 }}
                          />
                        )}
                      </div>
                      
                      {/* Label */}
                      <span className={`text-sm font-medium text-center leading-tight ${
                        isSelected ? "text-ink" : "text-ink/70"
                      }`}>
                        {m.label}
                      </span>
                      
                      {/* Price hint — Cycle 40: 14px, matches menu badges */}
                      <span className="font-mono text-sm font-semibold text-ink/70">
                        от {formatRUB(m.perGuest)}/чел
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Selected type description */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-3 text-xs text-ink/70 italic"
                >
                  {current.short}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* ═══ Guests Slider — Enhanced ═══ */}
            <div className="mt-8">
              <label className="font-mono text-xs uppercase tracking-wider text-ink/70 font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-gold/10 text-gold text-[11px] font-bold">2</span>
                  Количество гостей
                </span>
                <span className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-ink">{guests}</span>
                  <span className="text-xs text-ink/70">гостей</span>
                </span>
              </label>
              
              {guests < current.minGuests && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 flex items-center gap-1.5 font-mono text-xs text-terracotta bg-terracotta/10 px-3 py-1.5 rounded-full w-fit"
                >
                  <Sparkles className="size-3" />
                  Минимум для этого типа: {current.minGuests} гостей
                </motion.p>
              )}

              <div className="mt-5 relative">
                {/* Custom slider track with fill */}
                <div className="relative h-12 flex items-center">
                  {/* Background track */}
                  <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-cream" />

                  {/* Filled track (gold gradient) — min tracks the format
                      minimum so the fill never starts off-scale */}
                  <motion.div
                    className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold to-terracotta origin-left"
                    style={{
                      width: `${((guests - current.minGuests) / (500 - current.minGuests)) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />

                  {/* Tick marks — evenly spaced visually, labels show actual values.
                      Ticks below the format minimum are filtered out. */}
                  <div className="absolute inset-x-0 top-1/2 flex justify-between -translate-y-1/2 pointer-events-none">
                    {[current.minGuests, ...SLIDER_TICKS.filter(t => t > current.minGuests)].map((tick, i, arr) => {
                      const position = (i / (arr.length - 1)) * 100;
                      const isActive = guests >= tick;
                      return (
                        <div
                          key={tick}
                          className="flex flex-col items-center"
                          style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
                        >
                          <span className={`font-mono text-[12px] mb-1.5 ${isActive ? 'text-ink/70' : 'text-ink/70'}`}>
                            {tick >= 1000 ? `${tick/1000}k` : tick}
                          </span>
                          <div className={`w-0.5 rounded-full transition-colors ${isActive ? 'h-3 bg-gold/60' : 'h-2 bg-ink/15'}`} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Value bubble above thumb */}
                  <motion.div
                    className="absolute top-0 flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${((guests - current.minGuests) / (500 - current.minGuests)) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                    animate={{ y: [-2, 0, -2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <div className="bg-gradient-to-r from-gold to-terracotta text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-gold/30">
                      {guests}
                    </div>
                    <div className="w-2 h-2 bg-gold rotate-45 -mb-1 mt-1" />
                  </motion.div>

                  {/* Actual input (invisible but functional) — min bound to
                      the format minimum (Cycle 38 fix: the slider, the
                      estimate and the share link now always agree) */}
                  <input
                    type="range"
                    min={current.minGuests}
                    max={500}
                    step={5}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    aria-valuenow={guests}
                    aria-valuemin={current.minGuests}
                    aria-valuemax={500}
                    aria-label="Количество гостей"
                    className="relative z-10 h-12 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-gold [&::-webkit-slider-thumb]:to-terracotta [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-gold/40 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-gold [&::-moz-range-thumb]:to-terracotta [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-gold/40"
                  />
                </div>

                {/* Quick adjust buttons — respect the format minimum */}
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setGuests((g) => Math.max(current.minGuests, g - 5))}
                    className="flex items-center gap-1.5 rounded-full border border-border-line bg-cream/50 px-3 py-2.5 text-xs font-medium text-ink/70 hover:border-gold hover:bg-gold/10 hover:text-gold transition-all active:scale-95 min-h-[44px]"
                    aria-label="Меньше гостей"
                  >
                    <Minus className="size-3" /> −5
                  </button>

                  {/* Per-person indicator */}
                  <div className="flex items-center gap-2 text-sm text-ink/70">
                    <TrendingUp className="size-3.5 text-gold/60" />
                    <span>~{formatRUB(Math.round(result.total / guestsClamped))}/чел</span>
                  </div>

                  <button
                    onClick={() => setGuests((g) => Math.min(500, g + 5))}
                    className="flex items-center gap-1.5 rounded-full border border-border-line bg-cream/50 px-3 py-2.5 text-xs font-medium text-ink/70 hover:border-gold hover:bg-gold/10 hover:text-gold transition-all active:scale-95 min-h-[44px]"
                    aria-label="Больше гостей"
                  >
                    +5 <Plus className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ Addons — Enhanced Cards ═══ */}
            <div className="mt-8">
              <label className="font-mono text-xs uppercase tracking-wider text-ink/70 font-medium flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-gold/10 text-gold text-[11px] font-bold">3</span>
                Дополнительно
                {addons.length > 0 && (
                  <span className="ml-auto font-normal text-gold">
                    +{formatRUB(ADDONS.filter(a => addons.includes(a.id)).reduce((s, a) => s + a.price, 0))}
                  </span>
                )}
              </label>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const on = addons.includes(a.id);
                  const IconComponent = ADDON_ICONS[a.id];
                  return (
                    <motion.button
                      key={a.id}
                      onClick={() => toggleAddon(a.id)}
                      aria-pressed={on}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 ${
                        on
                          ? "border-gold bg-gradient-to-r from-gold/10 to-terracotta/5 shadow-sm"
                          : "border-border-line bg-cream/20 hover:border-gold/30 hover:bg-gold/5"
                      }`}
                    >
                      {/* Animated checkbox */}
                      <div className="relative shrink-0">
                        <motion.div
                          className={`flex size-6 items-center justify-center rounded-lg border-2 transition-colors ${
                            on
                              ? "border-gold bg-gradient-to-br from-gold to-terracotta"
                              : "border-border-line bg-white group-hover:border-gold/40"
                          }`}
                          animate={on ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <AnimatePresence mode="wait">
                            {on && (
                              <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 45 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              >
                                <Check className="size-3.5 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        
                        {/* Ripple effect on toggle */}
                        {on && (
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-gold"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.4, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                          />
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                        on ? "bg-gold/20 text-gold" : "bg-ink/5 text-ink/70 group-hover:bg-gold/10 group-hover:text-gold/70"
                      }`}>
                        {IconComponent && <IconComponent className="size-4" />}
                      </div>

                      {/* Label & Price */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${on ? 'text-ink' : 'text-ink/70'}`}>
                          {a.label}
                        </p>
                        <p className="font-mono text-xs text-ink/70">
                          +{formatRUB(a.price)}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ═══ Date picker ═══ */}
            <div role="group" aria-label="Дата мероприятия (необязательно)" className="mt-8">
              <div className="font-mono text-xs uppercase tracking-wider text-ink/70 font-medium flex items-center gap-2">
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-gold/10 text-gold text-[11px] font-bold">4</span>
                Дата мероприятия
                <span className="font-normal text-ink/70">(необязательно)</span>
              </div>
              <input
                type="date"
                id="calc-date"
                name="eventDate"
                value={date}
                aria-label="Дата мероприятия (необязательно)"
                onChange={(e) => setDate(e.target.value)}
                className="mt-3 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink outline-none focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 transition-all"
              />
              {date && seasonMultiplier(date) > 1 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-1.5 font-mono text-xs text-terracotta bg-terracotta/10 px-3 py-1.5 rounded-full w-fit"
                >
                  <Sparkles className="size-3" />
                  Сезонный коэффициент: +15%
                </motion.p>
              )}
            </div>
          </Reveal>

          {/* ═══ Result panel — Sticky with animations ═══ */}
          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-white to-cream p-6 shadow-xl shadow-gold/5 md:p-8 lg:sticky lg:top-28">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-ink/70 font-medium">
                  Предварительная смета
                </span>
                <div className="flex items-center gap-1 text-xs text-sage bg-sage/15 px-2 py-1 rounded-full">
                  <TrendingUp className="size-3" />
                  Онлайн-расчёт
                </div>
              </div>

              {/* Total with pulse animation */}
              <div className="mt-5 relative">
                <motion.div
                  className={`font-display gradient-text ${totalChanged ? '' : ''}`}
                  style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.5rem)", lineHeight: 1 }}
                  animate={totalChanged ? {
                    scale: [1, 1.03, 1],
                    textShadow: [
                      "0 0 0 rgba(212,175,55,0)",
                      "0 0 20px rgba(212,175,55,0.4)",
                      "0 0 0 rgba(212,175,55,0)",
                    ],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {display}
                </motion.div>
                
                {/* Per-person info */}
                <motion.div
                  className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-ink/70"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span>~ {formatRUB(Math.round(result.total / guestsClamped))} / чел</span>
                  <span>·</span>
                  <span>{guestsClamped} гостей</span>
                </motion.div>

                {/* Per-person range indicator */}
                <motion.div
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold/10 px-3 py-1.5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs text-ink/70">Диапазон:</span>
                  <span className="font-mono text-xs font-semibold text-gold">
                    {formatRUB(perPersonMin)} – {formatRUB(perPersonMax)} / чел
                  </span>
                </motion.div>
              </div>

              {/* Breakdown with staggered animation */}
              <div className="mt-6 space-y-1 border-t border-border-line pt-5 text-sm">
                <Row label={current.label} value={`${formatRUB(result.perGuest)} × ${guestsClamped}`} index={0} />
                <Row label="Итого" value={formatRUB(result.subtotal)} index={1} />
                {result.addonsTotal > 0 && (
                  <Row label="Дополнительно" value={formatRUB(result.addonsTotal)} index={2} highlight />
                )}
                {result.season > 1 && (
                  <Row label="Сезонный коэффициент" value={`×${result.season}`} index={3} warning />
                )}
                
                {/* Value indicator */}
                <motion.div
                  className="mt-4 flex items-center gap-2 rounded-lg bg-sage/15 px-3 py-2.5 text-xs text-sage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Check className="size-4 text-sage shrink-0" />
                  <span>
                    Включено: сервис, посуда, флористика, доставка в пределах КАД
                  </span>
                </motion.div>
              </div>

              {/* CTA Button — wrapped in <Magnetic> for cursor-tracking translation.
                  Cycle 38 fix: dispatches the calculator state so the contact
                  form pre-fills type/guests/date — the user's calculation is
                  no longer lost when crossing into the form. */}
              <Magnetic className="mt-7">
                <motion.a
                  href="#contact"
                  data-cursor="inquiry"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("catering:calc-lead", {
                        detail: {
                          typeId,
                          guests: guestsClamped,
                          date,
                          total: result.total,
                          addons: ADDONS.filter((a) =>
                            addons.includes(a.id),
                          ).map((a) => a.label),
                        },
                      }),
                    );
                  }}
                  className="group flex w-full items-center justify-center gap-2 rounded-full cta-gradient-punchy bg-gradient-to-r from-gold to-terracotta px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl active:scale-[0.98] min-h-[44px]"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Отправить заявку с расчётом
                  <Share2 className="size-4 transition-transform group-hover:translate-x-0.5" />
                </motion.a>
              </Magnetic>

              {/* Seasonal multiplier badge — visible when surcharge is active */}
              {result.season > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[12px] font-medium text-gold"
                  title="Сезонный спрос высок — итоговая стоимость подтверждается нашим менеджером"
                >
                  <Gift className="size-3.5" />
                  Сезонная надбавка +{Math.round((result.season - 1) * 100)}%
                  <span className="text-gold/60">·</span>
                  <span className="text-gold/70">спросите о весенних акциях</span>
                </motion.div>
              )}

              {/* Share button — copy URL */}
              <motion.button
                onClick={shareLink}
                data-cursor="link"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border-line px-5 py-3 text-xs font-medium uppercase tracking-wider text-ink/70 hover:border-gold hover:text-gold transition-colors active:scale-[0.98] min-h-[44px]"
                whileTap={{ scale: 0.97 }}
              >
                <Share2 className="size-3.5" />
                {copied ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sage"
                  >
                    ✓ Ссылка скопирована!
                  </motion.span>
                ) : (
                  "Поделиться расчётом"
                )}
              </motion.button>

              {/* Share to messengers — Telegram + WhatsApp */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href={telegramShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Поделиться расчётом в Telegram (откроется в новой вкладке)"
                  className="group flex items-center justify-center gap-2 rounded-full border border-border-line px-4 py-3 text-xs font-medium text-ink/70 hover:border-gold hover:text-gold transition-colors min-h-[44px]"
                >
                  <TelegramIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  Telegram
                </a>
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Поделиться расчётом в WhatsApp (откроется в новой вкладке)"
                  className="group flex items-center justify-center gap-2 rounded-full border border-border-line px-4 py-3 text-xs font-medium text-ink/70 hover:border-gold hover:text-gold transition-colors min-h-[44px]"
                >
                  <MessageCircle className="size-3.5 transition-transform group-hover:scale-110" />
                  WhatsApp
                </a>
              </div>

              <p className="mt-3 text-center font-mono text-xs text-ink/70">
                * Предварительная оценка. Итоговая стоимость — после консультации.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Row component for the breakdown with staggered animation */
function Row({ 
  label, 
  value, 
  index = 0,
  highlight = false,
  warning = false,
}: { 
  label: string; 
  value: string; 
  index?: number;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <motion.div
      className={`flex items-center justify-between py-2 ${highlight ? 'text-gold' : warning ? 'text-terracotta' : ''}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.3 }}
    >
      <span className={highlight || warning ? 'font-medium' : 'text-ink/70'}>{label}</span>
      <span className={`font-mono ${highlight ? 'font-semibold text-gold' : warning ? 'font-semibold text-terracotta' : 'font-medium text-ink'}`}>
        {value}
      </span>
    </motion.div>
  );
}

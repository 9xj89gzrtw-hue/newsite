"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Download, Loader2, Check, ChevronDown } from "lucide-react";
import { Reveal } from "./reveal";
import { MENU_TYPES, formatRUB, type MenuType } from "@/lib/pricing";
import { generateMenuPdf } from "@/lib/pdf-client";
import { toast } from "sonner";

/**
 * Menu section — LIGHT THEME with elegant tabs and cards
 */
export function Menu() {
  const [active, setActive] = useState(MENU_TYPES[0].id);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const current = MENU_TYPES.find((m) => m.id === active) ?? MENU_TYPES[0];
  const priceUnit = current.priceUnit ?? "/чел";

  const select = (id: string) => {
    setActive(id);
    setExpandedPackage(null);
    window.dispatchEvent(new CustomEvent("catering:menu-select", { detail: id }));
  };

  const dispatchMenuSelect = (id: string) => {
    window.dispatchEvent(new CustomEvent("catering:menu-select", { detail: id }));
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadPdf = async (typeId: string) => {
    if (downloading !== null) return;
    setDownloading(typeId);
    try {
      await generateMenuPdf(typeId);
      const isCatalog = typeId === "all";
      const t = MENU_TYPES.find((m) => m.id === typeId);
      toast.success(isCatalog ? "Каталог скачан" : `Меню «${t?.label}» скачано`);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сгенерировать PDF. Попробуйте ещё раз.");
    } finally {
      setDownloading(null);
    }
  };

  // Count-aware grid
  const gridCols =
    current.packages.length === 2
      ? "md:grid-cols-2"
      : current.packages.length === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="menu" className="relative overflow-hidden bg-cream py-24 md:py-36">
      {/* Subtle decoration */}
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-l from-gold/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Меню
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", lineHeight: 1 }}
              >
                Меню{" "}
                <span className="gradient-text italic">мероприятий</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-3 font-display italic text-lg text-ink/60">
                Пакеты с реальными блюдами и ценами. Скачайте PDF, чтобы показать команде.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Tabs */}
        <Reveal delay={0.15}>
          <div
            role="tablist"
            aria-label="Типы меню"
            className="mt-12 flex flex-wrap justify-center gap-2"
          >
            {MENU_TYPES.map((m) => (
              <button
                key={m.id}
                id={`tab-${m.id}`}
                role="tab"
                aria-selected={active === m.id}
                aria-controls="menu-panel"
                onClick={() => select(m.id)}
                className={`whitespace-nowrap rounded-full px-4 py-3 text-xs font-medium transition-all duration-300 min-h-[44px] sm:px-5 sm:py-2.5 sm:text-sm ${
                  active === m.id
                    ? "bg-gradient-to-r from-gold to-terracotta text-white shadow-md shadow-gold/25"
                    : "border border-border-line bg-white text-ink/70 hover:border-gold hover:text-gold"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Active menu context */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            id="menu-panel"
            role="tabpanel"
            aria-labelledby={`tab-${current.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            {/* Context line */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-center">
              <span className="rounded-full bg-gradient-to-r from-gold to-terracotta px-4 py-1.5 font-mono text-xs text-white shadow-sm">
                от {formatRUB(current.perGuest)} {priceUnit}
              </span>
              <span className="font-mono text-xs text-ink/50">
                мин. {current.minGuests} гостей
              </span>
              <span className="hidden text-ink/30 sm:inline">·</span>
              <span className="hidden text-xs text-ink/60 sm:inline">{current.short}</span>
            </div>

            {/* Packages carousel/grid */}
            <PackageCarousel packages={current.packages} current={current} expandedPackage={expandedPackage} setExpandedPackage={setExpandedPackage} dispatchMenuSelect={dispatchMenuSelect} priceUnit={priceUnit} />

            {/* Included in all packages */}
            <Reveal delay={0.3}>
              <div className="mt-8 rounded-2xl border border-border-line bg-white p-5 md:p-6 shadow-sm">
                <h4 className="font-mono text-xs uppercase tracking-wider text-gold font-medium">
                  ✓ Включено во все пакеты
                </h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {current.included.map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-ink/70">
                      <Check className="size-4 shrink-0 text-gold" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* PDF download buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => downloadPdf(current.id)}
                disabled={downloading !== null}
                aria-busy={downloading === current.id}
                aria-label={`Скачать меню «${current.label}» в PDF`}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-gold/25 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {downloading === current.id ? (
                  <><Loader2 className="size-4 animate-spin" /> Готовим PDF…</>
                ) : (
                  <><Download className="size-4 group-hover:animate-bounce" /> Скачать меню</>
                )}
              </button>
              <button
                onClick={() => downloadPdf("all")}
                disabled={downloading !== null}
                aria-busy={downloading === "all"}
                aria-label="Скачать полный каталог всех меню в PDF"
                className="flex items-center gap-2 rounded-full border border-border-line px-5 py-2.5 text-xs font-medium text-ink/70 transition-all hover:border-gold hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {downloading === "all" ? (
                  <><Loader2 className="size-4 animate-spin" /> Готовим…</>
                ) : (
                  <><Download className="size-4" /> Полный каталог</>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/**
 * Package carousel component
 */
function PackageCarousel({
  packages,
  current,
  expandedPackage,
  setExpandedPackage,
  dispatchMenuSelect,
  priceUnit,
}: {
  packages: MenuType["packages"];
  current: MenuType;
  expandedPackage: string | null;
  setExpandedPackage: (v: string | null) => void;
  dispatchMenuSelect: (id: string) => void;
  priceUnit: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScroll();
    if (window.innerWidth < 640 && el.scrollWidth > el.clientWidth) {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const hint = Math.min(maxScroll * 0.25, 120);
      const start = Date.now();
      const dur = 1500;
      const tick = () => {
        const t = (Date.now() - start) / dur;
        if (t >= 1) { el.scrollTo({ left: 0, behavior: "smooth" }); return; }
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        el.scrollTo({ left: hint * eased, behavior: "auto" });
        requestAnimationFrame(tick);
      };
      const timer = setTimeout(() => requestAnimationFrame(tick), 600);
      return () => clearTimeout(timer);
    }
  }, [current.id]);

  const gridCols =
    packages.length === 2
      ? "md:grid-cols-2"
      : packages.length === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="relative">
      {/* Edge fades on mobile */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-cream to-transparent md:hidden" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-cream to-transparent md:hidden" />
      )}

      <div
        ref={scrollRef}
        onScroll={updateScroll}
        className={`hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:gap-5 md:px-0 ${gridCols}`}
        style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}
      >
        {packages.map((pkg, idx) => {
          const isExpanded = expandedPackage === pkg.name;
          const showAll = isExpanded || packages.length === 1;
          const visibleDishes = showAll ? pkg.dishes : pkg.dishes.slice(0, 5);
          const hiddenCount = pkg.dishes.length - 5;
          const isPremium = idx === packages.length - 1 && packages.length >= 2;

          return (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              style={{ scrollSnapAlign: "start" }}
              className={`relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-md md:w-auto md:shrink card-l ${
                isPremium ? "border-gold/30 shadow-gold/10" : "border-border-line"
              }`}
            >
              {pkg.photo && (
                <div className="relative aspect-[4/3] overflow-hidden img-zoom">
                  <Image
                    src={pkg.photo}
                    alt={pkg.name}
                    fill
                    sizes="(max-width: 768px) 280px, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-gold">
                        Пакет {idx + 1}
                      </span>
                      <h3 className="font-display text-xl text-white font-medium">{pkg.name}</h3>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-gold to-terracotta px-3 py-1 font-mono text-xs text-white shadow-sm">
                      от {formatRUB(pkg.pricePerGuest)}{priceUnit}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-relaxed text-ink/60">{pkg.description}</p>

                <ul id={`dish-list-${idx}`} className="mt-4 space-y-2">
                  {visibleDishes.map((d, i) => (
                    <motion.li
                      key={i}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-baseline gap-2 text-sm"
                    >
                      <span className="font-mono text-xs text-ink/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-ink/80">{d.name}</span>
                      {d.weight && (
                        <span className="shrink-0 font-mono text-xs text-ink/40">
                          {d.weight}
                        </span>
                      )}
                    </motion.li>
                  ))}
                </ul>

                {hiddenCount > 0 && (
                  <button
                    aria-expanded={isExpanded}
                    aria-controls={`dish-list-${idx}`}
                    onClick={() => setExpandedPackage(isExpanded ? null : pkg.name)}
                    className="mt-3 flex items-center gap-1 text-xs text-gold hover:text-terracotta transition-colors min-h-[44px] font-medium"
                  >
                    {isExpanded ? "Свернуть" : `Показать ещё ${hiddenCount} позиций`}
                    <ChevronDown className={`size-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}

                <button
                  onClick={() => dispatchMenuSelect(current.id)}
                  className="group mt-5 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-gold/20 transition-all hover:shadow-lg hover:-translate-y-0.5 min-h-[44px]"
                >
                  Рассчитать
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

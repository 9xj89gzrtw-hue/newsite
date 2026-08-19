"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";
import { MEDIA, EVENT_CATEGORIES } from "@/lib/media";

type Category = (typeof EVENT_CATEGORIES)[number];

/**
 * EventsGallery — LIGHT THEME with filterable masonry + enhanced lightbox.
 *
 * Improvements vs. reference patterns:
 *  - A5 Filterable gallery: category tabs (nuqs-free local state) with
 *    AnimatePresence layout transitions.
 *  - B5 Lightbox: image counter ("3 / 12"), keyboard nav (← → Esc), and
 *    pinch-zoom-friendly touch-action.
 */
export function EventsGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [category, setCategory] = useState<Category>("Все");

  const all = MEDIA.events;
  const items = useMemo(
    () =>
      category === "Все"
        ? all
        : all.filter((e) => e.category === category),
    [all, category],
  );

  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(
    () =>
      setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length],
  );

  // Keyboard navigation inside the lightbox (B5).
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while the lightbox is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  return (
    <section id="events" className="relative overflow-hidden bg-cream-2 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                📸 События
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
              >
                Чем мы живём
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-xs text-base text-ink/60 font-display italic">
              Реальные мероприятия нашей команды. Нажмите на фото, чтобы рассмотреть.
            </p>
          </Reveal>
        </div>

        {/* Category filter (A5) */}
        <Reveal delay={0.15}>
          <div
            role="tablist"
            aria-label="Фильтр событий по типу"
            className="mt-10 flex flex-wrap gap-2"
          >
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={category === cat}
                onClick={() => {
                  setCategory(cat);
                  setOpen(null);
                }}
                className={`min-h-[44px] whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 sm:px-5 sm:text-sm ${
                  category === cat
                    ? "bg-gradient-to-r from-gold to-terracotta text-white shadow-md shadow-gold/25"
                    : "border border-border-line bg-white text-ink/70 hover:border-gold hover:text-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Masonry via CSS columns — animated filter transitions */}
        <motion.div
          layout
          className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.button
                key={`${item.src}-${item.caption}`}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setOpen(i)}
                data-cursor="смотреть"
                className="group relative block w-full overflow-hidden rounded-xl card-lift"
              >
                <div className={`relative w-full ${i % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[2.2s] ease-[cubic-bezier(0.14,0.4,0.09,0.99)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cream backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100 md:opacity-0">
                    {item.category}
                  </div>
                  <div className="absolute bottom-0 left-0 p-5 text-left opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    <span className="font-mono text-xs uppercase tracking-wider text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1 font-display text-lg text-white">{item.caption}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox — light theme, with counter + keyboard nav (B5) */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            {/* Counter (B5) */}
            <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-white/80">
              {open + 1} / {items.length}
            </div>

            <button
              className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={close}
              aria-label="Закрыть (Esc)"
            >
              <X className="size-6" />
            </button>
            <button
              className="absolute left-5 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Предыдущее (←)"
            >
              <ChevronLeft className="size-8" />
            </button>
            <motion.div
              key={open}
              className="relative max-h-[85vh] w-full max-w-5xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative aspect-[16/10] overflow-hidden rounded-xl"
                style={{ touchAction: "pinch-zoom" }}
              >
                <Image
                  src={items[open].src}
                  alt={items[open].caption}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-3 text-center">
                <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-gold">
                  {items[open].category}
                </span>
                <p className="font-display text-xl text-white">
                  {items[open].caption}
                </p>
              </div>
            </motion.div>
            <button
              className="absolute right-5 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Следующее (→)"
            >
              <ChevronRight className="size-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./reveal";
import { MEDIA } from "@/lib/media";

/**
 * EventsGallery — LIGHT THEME with masonry layout
 */
export function EventsGallery() {
  const [open, setOpen] = useState<number | null>(null);
  const items = MEDIA.events;

  const close = () => setOpen(null);
  const prev = () => setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
  const next = () => setOpen((i) => (i === null ? i : (i + 1) % items.length));

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

        {/* Masonry via CSS columns */}
        <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {items.map((item, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08}>
              <button
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
                  <div className="absolute bottom-0 left-0 p-5 text-left opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                    <span className="font-mono text-xs uppercase tracking-wider text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1 font-display text-lg text-white">{item.caption}</p>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox — light theme */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={close}
              aria-label="Закрыть"
            >
              <X className="size-6" />
            </button>
            <button
              className="absolute left-5 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Предыдущее"
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
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <Image
                  src={items[open].src}
                  alt={items[open].caption}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-center font-display text-xl text-white">
                {items[open].caption}
              </p>
            </motion.div>
            <button
              className="absolute right-5 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Следующее"
            >
              <ChevronRight className="size-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

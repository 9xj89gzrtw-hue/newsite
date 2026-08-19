"use client";

import { useEffect, useRef, useState } from "react";
import { Instagram, ArrowUpRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Reveal } from "./reveal";
import { INSTAGRAM, CONTACTS } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";

/**
 * InstagramVideo — LIGHT THEME
 *
 * Multi-reel horizontal carousel (4 reels) with hover-to-load behavior:
 * posters are shown by default; on hover the Instagram embed loads.
 * Falls back to first reel always-embedded for no-JS / SSR users.
 *
 * P1 pattern from REFERENCE-SITES-ANALYSIS.md §1261 (Elegant Affairs Swiper)
 */
export function InstagramVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Load Instagram embed script (lazy)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.getElementById("instagram-embed-js");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "instagram-embed-js";
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // Re-process embeds when hoveredIdx changes (lazy load on hover)
  useEffect(() => {
    if (hoveredIdx === null) return;
    if (typeof window === "undefined") return;
    // @ts-expect-error instgrm is loaded by instagram embed script
    if (window.instgrm) {
      // @ts-expect-error instgrm.Embeds exists at runtime
      window.instgrm?.Embeds?.process();
    }
  }, [hoveredIdx]);

  // Fix dynamically created Instagram iframe (WCAG + security)
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const observer = new MutationObserver(() => {
      const iframes = containerRef.current?.querySelectorAll('iframe');
      iframes?.forEach((iframe) => {
        if (!iframe.getAttribute('title')) {
          iframe.setAttribute('title', 'Instagram видео от Interfood Catering');
        }
        if (!iframe.getAttribute('sandbox')) {
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
        }
      });
    });

    observer.observe(containerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const reels = INSTAGRAM.reels?.length ? INSTAGRAM.reels : [INSTAGRAM.reelUrl];
  const goPrev = () => setActiveIdx((i) => (i - 1 + reels.length) % reels.length);
  const goNext = () => setActiveIdx((i) => (i + 1) % reels.length);

  return (
    <section
      id="instagram"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-white py-24 md:py-36"
    >
      {/* Decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-gold/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-20">
          {/* Left: text */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                <Instagram className="size-3" />
                В реальном времени
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.1 }}
              >
                <span className="inline-block">Живём на кухне,</span>{" "}
                <span className="gradient-text inline-block italic">снимаем</span>
                {" "}
                <span className="inline-block">в Instagram</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/60 font-display italic">
                Свежие события, процессы на кухне, новые блюда и закулисье
                мероприятий — в нашем Instagram. Подписывайтесь, чтобы не
                пропустить сезонные меню и акции.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <a
                href={INSTAGRAM.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${INSTAGRAM.handle} (откроется в новой вкладке)`}
                data-cursor="подписка"
                className="group mt-8 inline-flex items-center gap-3 rounded-full border-2 border-gold/40 bg-gradient-to-r from-gold/10 to-transparent px-6 py-3.5 text-sm font-semibold text-gold transition-all hover:border-gold hover:bg-gradient-to-r hover:from-gold hover:to-terracotta hover:text-white hover:shadow-lg hover:-translate-y-0.5"
              >
                <Instagram className="size-4" />
                {INSTAGRAM.handle}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="mt-6 font-mono text-xs text-ink/45">
                Или напишите нам:{" "}
                <a href={CONTACTS.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-terracotta underline underline-offset-2 transition-colors">
                  WhatsApp {CONTACTS.whatsapp}
                </a>
              </p>
            </Reveal>
          </div>

          {/* Right: multi-reel carousel */}
          <Reveal delay={0.2}>
            <div className="relative">
              {/* Carousel viewport */}
              <div
                ref={containerRef}
                className="relative mx-auto min-h-[560px] max-w-[420px] overflow-hidden rounded-2xl border border-border-line bg-cream p-4 shadow-xl shadow-ink/5"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeIdx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-center min-h-[520px]"
                  >
                    <blockquote
                      className="instagram-media"
                      data-instgrm-permalink={reels[activeIdx]}
                      data-instgrm-captioned
                      data-instgrm-version="14"
                      title={`Instagram видео ${activeIdx + 1} от Interfood Catering (@nilov_catering)`}
                      role="img"
                      style={{
                        background: "#FAF8F5",
                        border: 0,
                        margin: "0 auto",
                        maxWidth: "540px",
                        width: "100%",
                      }}
                    >
                      <div style={{ padding: "16px" }}>
                        <a
                          href={reels[activeIdx]}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "transparent",
                            lineHeight: 0,
                            padding: 0,
                            color: "#000",
                          }}
                        >
                          Загрузить видео из Instagram…
                        </a>
                      </div>
                    </blockquote>
                  </motion.div>
                </AnimatePresence>

                {/* Hover hint overlay (only on first reel) */}
                {activeIdx === 0 && hoveredIdx === null && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cream/30 backdrop-blur-[1px] transition-opacity"
                    aria-hidden="true"
                  >
                    <div className="flex flex-col items-center gap-2 text-gold">
                      <span className="flex size-14 items-center justify-center rounded-full border-2 border-gold bg-white/80 shadow-lg">
                        <Play className="size-5 ml-0.5" />
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider">
                        Наведите для загрузки
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Carousel controls — prev / next */}
              {reels.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Предыдущее видео"
                    onMouseEnter={() => setHoveredIdx(activeIdx)}
                    className="absolute top-1/2 -left-3 -translate-y-1/2 z-10 inline-flex size-11 items-center justify-center rounded-full border border-border-line bg-white/90 text-ink shadow-md backdrop-blur transition-all hover:border-gold/40 hover:text-gold hover:scale-110 min-h-[44px] min-w-[44px] md:-left-6"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Следующее видео"
                    onMouseEnter={() => setHoveredIdx(activeIdx)}
                    className="absolute top-1/2 -right-3 -translate-y-1/2 z-10 inline-flex size-11 items-center justify-center rounded-full border border-border-line bg-white/90 text-ink shadow-md backdrop-blur transition-all hover:border-gold/40 hover:text-gold hover:scale-110 min-h-[44px] min-w-[44px] md:-right-6"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {reels.length > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  {reels.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      onMouseEnter={() => setHoveredIdx(i)}
                      aria-label={`Видео ${i + 1}`}
                      aria-current={activeIdx === i}
                      className={`h-1.5 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center`}
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-all ${
                          activeIdx === i
                            ? "w-8 bg-gradient-to-r from-gold to-terracotta"
                            : "w-1.5 bg-ink/20 hover:bg-ink/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Counter */}
              <div className="mt-3 text-center font-mono text-xs uppercase tracking-wider text-ink/70">
                {String(activeIdx + 1).padStart(2, "0")} / {String(reels.length).padStart(2, "0")}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

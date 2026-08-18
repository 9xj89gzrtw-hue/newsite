"use client";

import { useEffect, useRef } from "react";
import { Instagram, ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";
import { INSTAGRAM, CONTACTS } from "@/lib/media";

/**
 * InstagramVideo — LIGHT THEME
 * 
 * Instagram reel section with official embed widget.
 */
export function InstagramVideo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.getElementById("instagram-embed-js");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "instagram-embed-js";
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    } else if ((window as any).instgrm) {
      (window as any).instgrm?.Embeds?.process();
    }
  }, []);

  // Fix dynamically created Instagram iframe (WCAG + security)
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    
    const observer = new MutationObserver(() => {
      const iframe = containerRef.current?.querySelector('iframe');
      if (iframe) {
        if (!iframe.getAttribute('title')) {
          iframe.setAttribute('title', 'Instagram видео от Interfood Catering');
        }
        if (!iframe.getAttribute('sandbox')) {
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
        }
      }
    });
    
    observer.observe(containerRef.current, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <section id="instagram" className="relative overflow-hidden bg-white py-24 md:py-36">
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
                Живём на кухне,{" "}
                <span className="gradient-text italic">снимаем</span>
                <br />в Instagram
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

          {/* Right: Instagram reel embed */}
          <Reveal delay={0.2}>
            <div
              ref={containerRef}
              className="relative mx-auto flex min-h-[560px] max-w-[420px] items-center justify-center rounded-2xl border border-border-line bg-cream p-4 shadow-xl shadow-ink/5"
            >
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={INSTAGRAM.reelUrl}
                data-instgrm-captioned
                data-instgrm-version="14"
                title="Instagram видео от Interfood Catering (@nilov_catering)"
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
                    href={INSTAGRAM.reelUrl}
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
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

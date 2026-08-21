"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * CepRedStats — Creative Edge Parties "stats band" replica (Cycle 27).
 *
 * The signature red moment of the entire CEP site: a full-bleed band on the
 * screaming accent red (#FF360A) with three giant white Neutra2Display-Light
 * stat numbers. Red is used as a section background EXACTLY ONCE on the whole
 * site — that restraint is what makes it pop so hard against the surrounding
 * black sections. Every screenshot of this band is instantly recognizable as
 * CEP. (creativeedge-analysis.md §6.5)
 *
 * Animation: when the band enters the viewport, the three numbers count up
 * from 0 to target over ~1.8s with easeOutCubic. Reduced-motion users see the
 * final values immediately (no count-up, no flash). SSR renders "0+" so the
 * markup is stable until the client takes over.
 *
 * RU thousands separator (thin space U+2009) — locale-independent formatter
 * so SSR/CSR markup is byte-identical (no hydration mismatch).
 */

type Stat = { value: number; suffix: string; caption: string };

const STATS: Stat[] = [
  { value: 16, suffix: "+", caption: "ЛЕТ НА РЫНКЕ" },
  { value: 2400, suffix: "+", caption: "СОБЫТИЙ ПРОВЕДЕНО" },
  { value: 180000, suffix: "+", caption: "ГОСТЕЙ НАКОРМЕНО" },
];

/**
 * Format an integer with the Russian thousands separator (thin space U+2009).
 * Deterministic — does not depend on Intl/locale, so SSR + CSR produce the
 * same string and we avoid hydration mismatches.
 *
 *   16      → "16"
 *   2400    → "2\u2009400"
 *   180000  → "180\u2009000"
 */
function formatRu(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009");
}

export function CepRedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const [vals, setVals] = useState<number[]>(STATS.map(() => 0));

  useEffect(() => {
    if (!mounted || !inView) return;

    // Reduced motion: jump straight to final values, no rAF.
    if (reduceMotion) {
      setVals(STATS.map((s) => s.value));
      return;
    }

    const duration = 1800; // ms
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVals(STATS.map((s) => s.value * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, mounted, reduceMotion]);

  return (
    <section
      ref={ref}
      data-header-theme="dark"
      aria-label="Цифры компании"
      className="cep-section-red relative py-16 md:py-20"
    >
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-12 px-8 md:grid-cols-3 md:px-14">
        {STATS.map((s, i) => (
          <div
            key={s.caption}
            className="flex flex-col items-center text-center"
          >
            <div className="cep-stat-number text-white">
              <span aria-hidden={false}>{formatRu(vals[i])}</span>
              <span aria-hidden="true">{s.suffix}</span>
            </div>
            <p
              className="cep-text mt-2 text-white/85"
              style={{ fontSize: "1.375rem" /* 22px — matches CEP caption scale */ }}
            >
              {s.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

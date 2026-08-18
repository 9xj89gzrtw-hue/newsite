"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Horizontal marquee bound to vertical scroll (Concept-Catering signature).
 * LIGHT THEME: warm cream background with gold accents and soft text.
 */
export function MarqueeBand() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

  const phrase =
    "Кейтеринг полного цикла • Фуршет • Банкет • Свадьбы • Корпоративы • Выездная регистрация • Барбекю • ";
  const items = Array.from({ length: 4 }, () => phrase);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border-y border-gold/20 bg-cream-2 py-5 md:py-7"
    >
      {/* Subtle gradient edges for fade effect */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream-2 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cream-2 to-transparent z-10 pointer-events-none" />
      
      <motion.div className="marquee-track" style={{ x }}>
        {items.map((t, i) => (
          <span
            key={i}
            className="font-display uppercase text-ink/60"
            style={{
              fontSize: "clamp(1.8rem, 4.5vw, 4.5rem)",
              lineHeight: 1,
            }}
          >
            {t}
            <span className="mx-6 inline-block size-3 rounded-full bg-gradient-to-r from-gold to-terracotta align-middle md:size-3.5" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

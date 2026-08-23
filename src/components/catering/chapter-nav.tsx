"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * ChapterNav — LIGHT THEME
 * 
 * Subtle vertical progress indicator on the right edge (desktop).
 * Shows a thin track + per-section dots; the current section dot fills gold.
 */
// Cycle 32: updated to match the new 17-section structure. Removed Manifesto
// (block was deleted). Renamed Services → ea-service-tabs, Events →
// page.tsx. Removed Events dot in Cycle 35 (events block deleted). Services
// id renamed #ea-service-tabs → #services for the new EaServices grid.
// Cycle 39: labels localized to Russian + nav hidden on non-home routes
// (previously 7 dead buttons on /offer, /privacy, /terms).
const SECTIONS = [
  { id: "hero", label: "Начало" },
  { id: "services", label: "Услуги" },
  { id: "menu", label: "Меню" },
  { id: "calculator", label: "Калькулятор" },
  { id: "about", label: "О нас" },
  { id: "faq", label: "Вопросы" },
  { id: "contact", label: "Контакты" },
];

export function ChapterNav() {
  const [active, setActive] = useState("hero");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  // Cycle 39: hide on static legal pages — the section anchors don't exist
  // there, leaving 7 dead buttons (critic 3 finding).
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.1, 0.3, 0.6] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!isHome) return null;

  return (
    <nav
      aria-label="Быстрая навигация по разделам"
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-3">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <button
                onClick={() => scrollTo(s.id)}
                className="group flex items-center gap-2.5 min-h-[44px] min-w-[44px] px-2 py-2"
                aria-label={`Перейти к разделу: ${s.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="sr-only">{s.label}</span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "size-2.5 bg-gradient-to-r from-gold to-terracotta shadow-sm shadow-gold/30"
                      : "size-1.5 bg-ink/20 group-hover:bg-gold/60"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
      {/* Vertical progress line */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-3 top-0 h-full w-px bg-border-line"
      >
        <motion.div
          className="w-full origin-top bg-gradient-to-b from-gold to-terracotta rounded-full"
          style={{ scaleY: progress, height: "100%" }}
        />
      </motion.div>
    </nav>
  );
}

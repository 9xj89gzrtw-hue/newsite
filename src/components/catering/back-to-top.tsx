"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop — LIGHT THEME
 * Floating button to scroll back to top of page.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Наверх страницы"
      className={`group fixed bottom-6 left-6 z-50 flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30 transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-16 opacity-0"
      }`}
    >
      <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}

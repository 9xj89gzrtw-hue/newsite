"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { CONTACTS } from "@/lib/media";

const NAV = [
  { href: "#about", label: "О нас" },
  { href: "#menu", label: "Меню" },
  { href: "#services", label: "Услуги" },
  { href: "#snack-box", label: "Доставка" },
  { href: "#video-events", label: "Видео" },
  { href: "#calculator", label: "Калькулятор" },
  { href: "#contact", label: "Контакты" },
];

/**
 * SiteHeader — transparent-to-solid navigation (LIGHT THEME)
 * 
 * Inspired by Sopranos, Pinch, and Wolfgang Puck:
 * - Transparent over hero, solid white on scroll
 * - Gold accent CTA button
 * - Smooth color transitions
 * - Full-screen mobile menu with warm tones
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Save scroll position before opening menu to prevent jump
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restore scroll position when closing
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, -parseInt(scrollY || "0", 10));
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open]);

  return (
    <>
      <header
        role="banner"
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-border-line py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
          {/* Logo */}
          <a
            href="#home"
            className="min-h-[44px] flex items-center font-display text-xl tracking-tight text-ink md:text-2xl hover-underline"
          >
            Interfood
            <span className="text-gold">.</span>
          </a>

          {/* Desktop Navigation */}
          <nav role="navigation" className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="group relative text-sm font-medium text-ink/70 transition-colors duration-300 hover:text-ink hover-underline"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <a
              href={CONTACTS.phoneHref}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 text-sm font-medium text-ink/80 transition-colors hover:text-gold md:gap-2"
              aria-label="Позвонить"
            >
              <Phone className="size-5 shrink-0" />
              <span className="hidden md:inline">{CONTACTS.phone}</span>
            </a>
            <a
              href="#calculator"
              className="group min-h-[44px] inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md shadow-gold/20 transition-all duration-300 hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5 sm:px-6 sm:text-sm"
            >
              <span className="hidden sm:inline">Рассчитать</span>
              <span className="sm:hidden">Расчёт</span>
            </a>
            <button
              onClick={() => setOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-3 text-ink lg:hidden"
              aria-label="Открыть меню"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu — warm gold/cream theme */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-br from-cream to-parchment px-6 py-6 lg:hidden"
            id="mobile-menu"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl text-ink">
                Interfood<span className="text-gold">.</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-3 text-ink"
                aria-label="Закрыть меню"
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                <X className="size-7" />
              </button>
            </div>

            <nav className="mt-16 flex flex-col gap-1">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="group py-4 min-h-[44px] flex items-center justify-between border-b border-border-line/50 font-display text-3xl text-ink transition-colors hover:text-gold"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  {n.label}
                  <ArrowRightIcon className="size-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto space-y-3 text-ink">
              <a
                href={CONTACTS.phoneHref}
                className="flex items-center gap-3 text-2xl font-display hover:text-gold transition-colors"
              >
                <Phone className="size-5" />
                {CONTACTS.phone}
              </a>
              <a
                href={CONTACTS.whatsappHref}
                className="flex items-center gap-3 text-sm text-ink/70 hover:text-gold transition-colors"
              >
                <MessageCircle className="size-4" />
                WhatsApp: {CONTACTS.whatsapp}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB — sticky phone button */}
      <a
        href={CONTACTS.phoneHref}
        aria-label="Позвонить"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30 transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
      >
        <Phone className="size-6" />
      </a>
    </>
  );
}

/** Simple arrow icon for mobile menu */
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

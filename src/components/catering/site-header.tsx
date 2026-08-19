"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, MessageCircle, ChevronDown, Calculator } from "lucide-react";
import { CONTACTS } from "@/lib/media";
import { SERVICES } from "@/lib/media";
import { MENU_TYPES } from "@/lib/pricing";
import { AnnouncementBar } from "./announcement-bar";

type NavItem = {
  href: string;
  label: string;
  mega?: "menu" | "services";
};

const NAV: NavItem[] = [
  { href: "#about", label: "О нас" },
  { href: "#menu", label: "Меню", mega: "menu" },
  { href: "#services", label: "Услуги", mega: "services" },
  { href: "#events", label: "События" },
  { href: "#snack-box", label: "Доставка" },
  { href: "#calculator", label: "Калькулятор" },
  { href: "#contact", label: "Контакты" },
];

/**
 * The header theme is set per-section via `data-header-theme` attributes
 * on each `<section>` element. Valid values: "transparent" (over hero),
 * "light" (cream/white sections), "dark" (Manifesto, PromoBanner).
 */
type HeaderTheme = "transparent" | "light" | "dark";

const THEME_CLASSES: Record<HeaderTheme, { bg: string; text: string; linkHover: string }> = {
  transparent: {
    bg: "bg-transparent",
    text: "text-cream",
    linkHover: "hover:text-cream",
  },
  light: {
    bg: "bg-cream/85 backdrop-blur-md shadow-sm border-b border-border-line",
    text: "text-ink",
    linkHover: "hover:text-ink",
  },
  dark: {
    bg: "bg-ink/85 backdrop-blur-md shadow-lg border-b border-ink/20",
    text: "text-cream",
    linkHover: "hover:text-cream",
  },
};

/**
 * SiteHeader — theme-switching navigation (transparent → light → dark)
 * based on which section's `data-header-theme` attribute is currently
 * in view at the top of the viewport.
 *
 * Includes:
 *  - AnnouncementBar: dismissible seasonal top bar (Salt Block pattern).
 *  - MegaMenu: hover/focus dropdowns for Меню and Услуги (100% adoption pattern).
 *  - Mobile quote CTA: second FAB linking to the calculator (sticky-CTA pattern).
 *  - Section-aware theme switching via IntersectionObserver.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Default theme = transparent (over hero).
  const [theme, setTheme] = useState<HeaderTheme>("transparent");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver: detect which section's `data-header-theme`
  // attribute is currently overlapping the top of the viewport (where the
  // header sits). Updates `theme` state. SSR-safe.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;

    // Header occupies roughly the top ~64px of viewport. We collapse the
    // observer root to a thin band at the very top (negative bottom margin
    // = -100% reduces root height to 0). A section that has any pixel
    // overlapping that 0-px band is "intersecting" — exactly what we want.
    const io = new IntersectionObserver(
      (entries) => {
        // Among intersecting entries, pick the topmost (smallest
        // boundingClientRect.top). Handles edge case where two sections
        // both touch the 0-line briefly during fast scroll.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const topEl = visible[0].target as HTMLElement;
        const next = (topEl.dataset.headerTheme as HeaderTheme | undefined) ?? "transparent";
        setTheme((cur) => (cur === next ? cur : next));
      },
      {
        // Top 0px = the very top of viewport. We pick a slightly positive
        // height (top -1px to avoid weird flicker at exact 0).
        rootMargin: "-1px 0px -100% 0px",
        threshold: [0, 1],
      },
    );

    const observeAll = () => {
      document.querySelectorAll<HTMLElement>("[data-header-theme]").forEach((el) => {
        io.observe(el);
      });
    };
    // Run once on mount + re-run after a tick in case sections are still
    // hydrating/mounting (some are client components that mount late).
    observeAll();
    const t = window.setTimeout(observeAll, 600);

    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
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

  const themeClasses = THEME_CLASSES[theme];

  return (
    <>
      <header
        role="banner"
        data-theme={theme}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}
      >
        {/* Dismissible seasonal announcement bar (Salt Block pattern) */}
        <AnnouncementBar />

        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 md:px-8 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          {/* Logo */}
          <a
            href="#home"
            className={`min-h-[44px] flex items-center font-display text-xl tracking-tight transition-colors duration-300 md:text-2xl hover-underline ${themeClasses.text}`}
          >
            Interfood
            <span className="text-gold">.</span>
          </a>

          {/* Desktop Navigation with mega-menus */}
          <nav role="navigation" className="hidden items-center gap-x-6 lg:flex xl:gap-x-7">
            {NAV.map((n) =>
              n.mega ? (
                <MegaMenu key={n.href} item={n} />
              ) : (
                <a
                  key={n.href}
                  href={n.href}
                  className={`group relative text-sm font-medium opacity-70 transition-opacity duration-300 hover:opacity-100 hover-underline ${themeClasses.text}`}
                >
                  {n.label}
                </a>
              ),
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <a
              href={CONTACTS.phoneHref}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-gold md:gap-2 ${themeClasses.text} opacity-80 hover:opacity-100`}
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
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-3 transition-colors duration-300 lg:hidden ${themeClasses.text}`}
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

            <nav className="mt-10 flex flex-col gap-1 overflow-y-auto scroll-warm">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="group py-4 min-h-[44px] flex items-center justify-between border-b border-border-line/50 font-display text-2xl text-ink transition-colors hover:text-gold"
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

      {/* Mobile FABs — phone (bottom) + calculate (above) */}
      <a
        href="#calculator"
        aria-label="Рассчитать стоимость"
        className="fixed bottom-24 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta text-white shadow-lg shadow-gold/30 transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
      >
        <Calculator className="size-6" />
      </a>
      <a
        href={CONTACTS.phoneHref}
        aria-label="Позвонить"
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full border-2 border-gold/40 bg-white/90 text-gold shadow-lg shadow-gold/20 backdrop-blur-sm transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
      >
        <Phone className="size-6" />
      </a>
    </>
  );
}

/**
 * MegaMenu — hover/focus dropdown for nav items with sub-content.
 * Opens on mouseenter/focus, closes on mouseleave/blur (150ms delay to allow
 * diagonal mouse travel). Keyboard: Enter/Space toggles, Esc closes.
 * Clicking a sub-item dispatches the matching CustomEvent and scrolls.
 */
function MegaMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const selectMenu = (id: string) => {
    window.dispatchEvent(new CustomEvent("catering:menu-select", { detail: id }));
    go("#menu");
    setOpen(false);
  };

  const selectService = (index: number) => {
    window.dispatchEvent(new CustomEvent("catering:service-open", { detail: index }));
    go("#services");
    setOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={(e) => {
        // Close only when focus leaves the whole dropdown subtree.
        if (!e.currentTarget.contains(e.relatedTarget as Node)) closeSoon();
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onKeyDown={onTriggerKey}
        onClick={() => go(item.href)}
        className="group flex min-h-[44px] items-center gap-1 text-sm font-medium opacity-70 transition-opacity duration-300 hover:opacity-100"
      >
        {item.label}
        <ChevronDown
          className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180 text-gold" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={item.label}
            className="absolute left-1/2 top-full z-50 mt-2 w-[34rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border-line bg-white/97 shadow-2xl shadow-ink/10 backdrop-blur-xl"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.mega === "menu" ? (
              <div className="grid grid-cols-[1fr_1fr] gap-0">
                <div className="p-4">
                  <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                    Типы меню
                  </p>
                  <ul className="grid grid-cols-1 gap-0.5">
                    {MENU_TYPES.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => selectMenu(m.id)}
                          className="group flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-gold/8"
                        >
                          <span className="text-sm font-medium text-ink/80 group-hover:text-gold">
                            {m.label}
                          </span>
                          <span className="font-mono text-[11px] text-ink/45">
                            от {m.perGuest.toLocaleString("ru-RU")} ₽
                            {m.priceUnit ?? "/чел"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Featured card */}
                <a
                  href="#menu"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group relative block overflow-hidden rounded-l-2xl"
                >
                  <img
                    src="/media/menu-banquet.jpg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                  <div className="relative flex h-full min-h-[16rem] flex-col justify-end p-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                      Сезон 2026
                    </span>
                    <p className="mt-2 font-display text-xl text-white">
                      Свадебное банкетное меню
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-cream/90 transition-colors group-hover:text-gold">
                      Смотреть меню →
                    </span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_1fr] gap-0">
                <div className="p-4">
                  <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                    Услуги под ключ
                  </p>
                  <ul className="grid grid-cols-1 gap-0.5">
                    {SERVICES.map((s, i) => (
                      <li key={s.title}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => selectService(i)}
                          className="group flex w-full flex-col items-start rounded-lg px-2 py-2 text-left transition-colors hover:bg-gold/8"
                        >
                          <span className="text-sm font-medium text-ink/80 group-hover:text-gold">
                            {s.title}
                          </span>
                          <span className="text-[11px] text-ink/45">{s.short}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Featured card */}
                <a
                  href="#services"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group relative block overflow-hidden rounded-l-2xl"
                >
                  <img
                    src="/media/event-chef-action.jpg"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                  <div className="relative flex h-full min-h-[16rem] flex-col justify-end p-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                      Open kitchen
                    </span>
                    <p className="mt-2 font-display text-xl text-white">
                      Выездной ресторан с шефом
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-cream/90 transition-colors group-hover:text-gold">
                      Все услуги →
                    </span>
                  </div>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

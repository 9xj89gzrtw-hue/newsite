"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { CONTACTS } from "@/lib/media";
import { CepOverlayMenu } from "./cep-overlay-menu";

/**
 * SiteHeader — Talk of the Town (talkofthetownatlanta.com) header graft
 * (Cycle 30). Reproduces their "hero slider on top, sticky nav bar below"
 * pattern, adapted so the nav bar DOCKS AT THE BOTTOM of our full-viewport
 * video hero, then sticks to the top once scrolled past the hero.
 *
 * Layout (their fusion-header-wrapper, height ~84px):
 *   - Logo LEFT  → "Interfood." wordmark in Prata (their display serif),
 *                  gold dot = Interfood brand signature.
 *   - Nav CENTER → 5 items in Lato (their body/nav font, has Cyrillic):
 *                  Меню · Услуги · События · О нас · Контакты.
 *   - CTA RIGHT  → burgundy gradient phone button (their fusion-menu-item-
 *                  button pattern → `.tott-cta-btn`).
 *
 * Position logic:
 *   - At top (scrollY < heroHeight): `fixed bottom-0` — nav sits at the
 *     bottom edge of the 100vh hero (over the video), transparent bg,
 *     white text. This is the "menu at the bottom" the brief asks for.
 *   - Scrolled past hero: `fixed top-0` — cream bg, dark text, shadow.
 *
 * Mobile: hamburger (right) opens a full-screen motion menu (existing
 * pattern). Phone FABs preserved. Desktop CepOverlayMenu trigger removed
 * — nav items are shown directly (talkofthetown shows them inline, not
 * behind a MENU button).
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (header structure)
 */

type NavItem = { href: string; label: string };

// 5-item nav matching talkofthetownatlanta.com (Catering · Menus · Venues ·
// Meet TOTT · Contact) → mapped to Interfood's real section IDs.
const NAV: NavItem[] = [
  { href: "#menu", label: "Меню" },
  { href: "#ea-service-tabs", label: "Услуги" },
  { href: "#ea-events-portfolio", label: "События" },
  { href: "#about", label: "О нас" },
  { href: "#contact", label: "Контакты" },
];

export function SiteHeader() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [cepMenuOpen, setCepMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Focus management for mobile menu dialog
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      setTimeout(() => closeBtnRef.current?.focus(), 100);
    } else if (!open && prevOpen.current) {
      triggerRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  // Sticky detection: header is "stuck" when its top reaches 0 (i.e. the
  // hero has scrolled past). Uses getBoundingClientRect for precision (works
  // regardless of hero height / dynamic viewport). Per task v5: "после того
  // как он поднимается до верха экрана то остается там и становится немного
  // прозрачным" — when stuck, switch to translucent white + blur.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => {
      setStuck(header.getBoundingClientRect().top <= 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open.
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) window.scrollTo(0, -parseInt(scrollY || "0", 10));
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open]);

  // Header is `position: sticky; top: 0` and sits in normal flow AFTER the
  // 100vh hero (see page.tsx). Per task v5: "хеадер сначала находится внизу
  // секции херо и его даже не видно, потом херо вместе с ним мотается вверх и
  // после того как он поднимается до верха экрана то остается там и становится
  // немного прозрачным" — initially below the fold (not visible), scrolls up
  // with the hero, sticks at top, then becomes slightly translucent.
  // Background: solid white when scrolling into view; translucent white +
  // backdrop-blur when stuck (Avada sticky-header feel).

  return (
    <>
      <header
        ref={headerRef}
        role="banner"
        data-tott-state={stuck ? "stuck" : "flow"}
        inert={open}
        aria-hidden={open}
        className={`sticky top-0 z-50 border-b border-border-line text-ink transition-colors duration-500 ${
          stuck
            ? "bg-white/60 shadow-[0_6px_24px_-14px_rgba(0,0,0,0.14)] backdrop-blur-lg"
            : "bg-white"
        }`}
      >
        <div
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 transition-all duration-500 md:px-8"
        >
          {/* Logo LEFT — Prata wordmark (their display serif). */}
          <a
            href="#main-content"
            className="min-h-[44px] flex items-center transition-opacity duration-300 hover:opacity-80"
            aria-label="Interfood Catering — главная"
          >
            <span
              className="tott-display text-2xl md:text-[28px]"
              style={{ letterSpacing: "0.005em", fontWeight: 400 }}
            >
              Interfood<span style={{ color: "var(--gold)" }}>.</span>
            </span>
          </a>

          {/* Nav CENTER — 5 items in Lato (hidden on mobile). */}
          <nav
            className="hidden lg:flex items-center gap-8"
            aria-label="Основная навигация"
          >
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="tott-body min-h-[44px] flex items-center text-[15px] font-700 uppercase tracking-[0.04em] opacity-85 transition-all duration-300 hover:opacity-100 hover:text-tott-burgundy"
                style={{ fontWeight: 700 }}
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Phone — mirrors their nav `fusion-menu-item-button`: a simple
              text + phone-icon link styled as the LAST nav menu item (NOT a
              heavy gradient CTA). Theirs: `<span class="menu-text fusion-button
              button-default button-medium"><span class="button-icon-divider-left">
              <i class="fa-phone-alt"></i></span><span>404-334-4935</span></span>`.
              Per task v4: "кнопка заказать у них в какой стилистике? почему у
              нас так стремно выглядит" → strip the burgundy gradient, use a
              quiet text+icon link matching the nav items' typographic weight. */}
          <div className="flex items-center gap-3">
            <a
              href={CONTACTS.phoneHref}
              className="tott-body hidden min-h-[44px] items-center gap-2 text-[15px] font-700 uppercase tracking-[0.04em] text-ink opacity-85 transition-all duration-300 hover:opacity-100 hover:text-tott-burgundy sm:inline-flex"
              style={{ fontWeight: 700 }}
              aria-label={`Позвонить ${CONTACTS.phone}`}
            >
              <Phone className="size-4 shrink-0" />
              <span>{CONTACTS.phone}</span>
            </a>
            {/* Заказать — BLACK square button (task v6: "кнопку заказать в
                черном квадратике на хедере на белом фоне как на сайте"). Solid
                black bg, white text, square corners, hover darken. → #contact */}
            <a
              href="#contact"
              className="tott-body hidden min-h-[44px] items-center justify-center bg-black px-5 text-[13px] font-700 uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-ink/85 sm:inline-flex"
              style={{ fontWeight: 700, borderRadius: 0 }}
              aria-label="Заказать кейтеринг"
            >
              Заказать
            </a>
            {/* Mobile: phone icon only */}
            <a
              href={CONTACTS.phoneHref}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tott-burgundy transition-colors sm:hidden"
              aria-label={`Позвонить ${CONTACTS.phone}`}
            >
              <Phone className="size-6" />
            </a>
            {/* Mobile menu trigger */}
            <button
              ref={triggerRef}
              onClick={() => setOpen(true)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-3 text-ink transition-colors lg:hidden"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open ? "true" : "false"}
              aria-controls="mobile-menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu — WHITE theme */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-white px-6 py-6 lg:hidden"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Меню навигации"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: [0.83, 0, 0.17, 1] }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Tab") {
                const menu = e.currentTarget;
                const focusable = menu.querySelectorAll<HTMLElement>(
                  'button, [href], input, [tabindex]:not([tabindex="-1"])',
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="tott-display text-3xl text-ink">
                Interfood<span style={{ color: "var(--gold)" }}>.</span>
              </span>
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-3 text-ink"
                aria-label="Закрыть меню"
                aria-expanded={open ? "true" : "false"}
                aria-controls="mobile-menu"
              >
                <X className="size-7" />
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-1 overflow-y-auto">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.label + i}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="tott-body group py-4 min-h-[44px] flex items-center justify-between border-b border-border-line/50 text-2xl font-700 text-ink transition-colors hover:text-tott-burgundy"
                  style={{ fontWeight: 700 }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  {n.label}
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto space-y-3 text-ink">
              <a
                href={CONTACTS.phoneHref}
                className="tott-body flex min-h-[44px] items-center gap-3 py-2 text-2xl font-700 hover:text-tott-burgundy"
                style={{ fontWeight: 700 }}
              >
                <Phone className="size-5" />
                {CONTACTS.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FABs — phone (bottom) */}
      <a
        href={CONTACTS.phoneHref}
        aria-label="Позвонить Interfood Catering"
        className="fixed bottom-6 right-6 z-[70] flex size-14 items-center justify-center rounded-full bg-tott-burgundy text-white shadow-lg shadow-tott-burgundy/30 transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
      >
        <Phone className="size-6" />
      </a>

      {/* CepOverlayMenu kept available (triggered programmatically if needed). */}
      <CepOverlayMenu isOpen={cepMenuOpen} onClose={() => setCepMenuOpen(false)} />
    </>
  );
}

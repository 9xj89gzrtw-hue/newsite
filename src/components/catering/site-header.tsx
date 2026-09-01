"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { CONTACTS } from "@/lib/media";

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
 * Dark-section flip (FX5, C67 wave B; v2 — CX4, wave C): sections across the
 * site declare `data-header-theme="dark"` (founder story, video showcase,
 * parallax band, footer, …). While ANY such section covers the vertical
 * MIDPOINT of the sticky header band, the header flips to a dark variant:
 * translucent ink glass (#161312/85) + cream text (≥ 4.5:1 AA; hover — gold).
 * v1 used an IntersectionObserver whose root was exactly the header band —
 * it flipped OUT only when a section FULLY left the band, so the light next
 * section scrolled under a still-dark header (critic: ~816px perceived
 * hold-over) and the 500ms crossfade read muddy. v2 trigger = band-midpoint
 * coverage (rect.top <= bandMid && rect.bottom >= bandMid), evaluated on a
 * rAF-throttled scroll handler; section document offsets are cached on
 * resize, and getBoundingClientRect is read ONLY when the band midpoint is
 * within ±1.5 viewport heights of a section's cached bounds (no per-frame
 * layout reads when far away; near reads write the fresh rect back to the
 * cache). Crossfade 500ms → 300ms. SSR/first render = light (state starts
 * false): the attribute is an enhancement — no-JS/reduced-motion never flip,
 * header stays light and readable (5.7:1) — no hydration mine (§34).
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (header structure)
 */

type NavItem = { href: string; label: string };

// 5-item nav matching talkofthetownatlanta.com (Catering · Menus · Venues ·
// Meet TOTT · Contact) → mapped to Interfood's real section IDs.
const NAV: NavItem[] = [
  { href: "#menu", label: "Меню" },
  { href: "#services", label: "Услуги" },
  { href: "#about", label: "О нас" },
  { href: "#contact", label: "Контакты" },
];

export function SiteHeader() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  // FX5 (C67 wave B): a [data-header-theme="dark"] section occupies the
  // header band right now. Starts false → SSR/first render = light.
  const [themeDark, setThemeDark] = useState(false);
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

  // FX5 v2 (CX4, wave C): dark-section watcher. Trigger = band-midpoint
  // coverage: dark iff a dark section's rect covers the header band's
  // vertical midpoint. rAF-throttled scroll handler; document offsets cached
  // on resize (+ refreshed from every near gBCR read — self-healing against
  // lazy-layout drift); precise rect reads ONLY within ±1.5 viewport heights
  // of cached bounds — zero per-frame layout reads when far away. rAF and
  // listeners are cleaned up on unmount. No ref writes in render (§37).
  //
  // FX5-N2 (волна-D): инстантные программные прыжки по якорям (location.hash,
  // прямая загрузка /#about) не гарантируют scroll-события после скачка, а
  // дрейф лэйаута ПОСЛЕ прыжка (ленивые картинки, шрифты, late-mount блоки)
  // вообще не порождает ни scroll, ни resize — кэш границ и bandMid стареют,
  // шапка читает свет над тёмной секцией до первого реального скролла юзера
  // (замер: founder top-in-vp 66px < bandMid 110px → scheme залипает «light»).
  // Фикс: (1) evaluate однократно на монте — уже было (cache()+evaluate());
  // (2) listener 'hashchange' → re-cache + evaluate на следующем кадре;
  // (3) ResizeObserver на body — дрейф документа без скролла тоже пере-оцениваем
  // (ResizeObserver доступен базово, в effect — React Compiler safe, §37).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]'),
    );
    if (sections.length === 0) return;

    let bounds: Array<{ el: HTMLElement; top: number; bottom: number }> = [];
    let bandMid = (header.offsetHeight || 84) / 2;
    let raf = 0;

    const cache = () => {
      const docTop = window.scrollY;
      bandMid = (header.offsetHeight || 84) / 2;
      bounds = sections.map((el) => {
        const r = el.getBoundingClientRect();
        return { el, top: r.top + docTop, bottom: r.bottom + docTop };
      });
    };

    const evaluate = () => {
      raf = 0;
      const docMid = window.scrollY + bandMid;
      const reach = window.innerHeight * 1.5;
      let dark = false;
      for (const b of bounds) {
        // Fast path: cached bounds say we are far away — no layout read.
        if (docMid < b.top - reach || docMid > b.bottom + reach) continue;
        const r = b.el.getBoundingClientRect();
        // Self-heal the cache with the fresh rect (lazy layout drift).
        const docTop = window.scrollY;
        b.top = r.top + docTop;
        b.bottom = r.bottom + docTop;
        if (r.top <= bandMid && r.bottom >= bandMid) {
          dark = true;
          break;
        }
      }
      setThemeDark(dark); // React bails out when the value is unchanged
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(evaluate);
    };
    const onResize = () => {
      cache();
      onScroll();
    };
    // FX5-N2: re-cache + re-evaluate без пользовательского скролла. Хэш-прыжок
    // скачет мгновенно (scroll-margin-top:84px сажает секцию под шапку) и может
    // совпасть с дрейфом лэйаута — старые doc-границы уводят fast-path мимо
    // секции, поэтому пересобираем кэш ДО оценки кадра.
    const reCacheAndEvaluate = () => {
      cache();
      onScroll();
    };
    const onHash = () => reCacheAndEvaluate();
    // Дрейф лэйаута (картинки/шрифты/Suspense-вставки) меняет высоту body —
    // ни scroll, ни resize при этом не приходят. RO догоняет геометрию.
    const ro = new ResizeObserver(() => reCacheAndEvaluate());

    cache();
    evaluate();
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onHash);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
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
  // FX5 (v2): dark variant — only while STUCK over a [data-header-theme=dark]
  // section whose rect covers the header band midpoint (in flow, at the hero
  // bottom, the top band is the hero itself — nothing to flip for).
  const dark = stuck && themeDark;

  return (
    <>
      <header
        ref={headerRef}
        role="banner"
        data-tott-state={stuck ? "stuck" : "flow"}
        data-header-scheme={dark ? "dark" : "light"}
        inert={open}
        aria-hidden={open}
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          dark
            ? "border-[#F7F5F5]/10 bg-[#161312]/85 text-[#F7F5F5] shadow-[0_6px_24px_-14px_rgba(0,0,0,0.6)] backdrop-blur-lg"
            : stuck
              ? "border-border-line bg-white/60 text-ink shadow-[0_6px_24px_-14px_rgba(0,0,0,0.14)] backdrop-blur-lg"
              : "border-border-line bg-white text-ink"
        }`}
      >
        <div
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 transition-all duration-500 md:px-8"
        >
          {/* Logo LEFT — NILOV round badge (Task 6-D, nilov rebrand).
              Cycle 31.3 history: the Prata wordmark used to be hidden on
              desktop (lg:opacity-0 anchor) because the vertical sidebar
              carried the brand. Now the round badge (40px mobile / 36px
              desktop) IS the desktop brand mark — small and quiet, before
              the nav. Mobile (<lg) keeps badge + Prata wordmark
              ("nilov catering.") — mobile has no sidebar.
              Micro-wow: whileHover springs the badge a few degrees
              (transform only). Dark scheme (FX5): thin gold ring keeps the
              black circle readable against the ink-glass header. */}
          <a
            href="#main-content"
            className="min-h-[44px] lg:min-w-[44px] flex items-center gap-3 transition-opacity duration-300 hover:opacity-80"
            aria-label="nilov catering — главная"
          >
            <motion.span
              className={`relative flex size-10 lg:size-9 shrink-0 items-center justify-center rounded-full transition-shadow duration-300 ${
                dark ? "ring-1 ring-gold/60" : ""
              }`}
              whileHover={{ rotate: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
            >
              <Image
                src="/brand/logo-128.png"
                alt="Логотип nilov catering — круглый бейдж"
                width={128}
                height={128}
                priority
                className="size-10 lg:size-9"
              />
            </motion.span>
            <span
              className="tott-display text-[20px] md:text-[26px] lg:hidden whitespace-nowrap"
              style={{ letterSpacing: "0.005em", fontWeight: 400 }}
            >
              nilov&nbsp;catering<span style={{ color: "var(--gold)" }}>.</span>
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
                className={`tott-body min-h-[44px] flex items-center text-[15px] font-700 uppercase tracking-[0.04em] opacity-85 transition-all duration-300 hover:opacity-100 ${
                  // FX5: burgundy hover dies on ink (≈1.6:1) — gold in dark.
                  dark ? "hover:text-[#D4A373]" : "hover:text-tott-burgundy"
                }`}
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
              className={`tott-body hidden min-h-[44px] items-center gap-2 text-[15px] font-700 uppercase tracking-[0.04em] opacity-85 transition-all duration-300 hover:opacity-100 sm:inline-flex ${
                dark ? "text-[#F7F5F5] hover:text-[#D4A373]" : "text-ink hover:text-tott-burgundy"
              }`}
              style={{ fontWeight: 700 }}
              aria-label={`Позвонить ${CONTACTS.phone}`}
            >
              <Phone className="size-4 shrink-0" />
              <span>{CONTACTS.phone}</span>
            </a>
            {/* Заказать — BLACK OUTLINE button (task v7: "кнопка заказать в
                черной рамке а не черном квадрате"). Transparent bg, black
                border, black text, square corners, hover fills black. → #contact */}
            <a
              href="#contact"
              className={`tott-body hidden min-h-[44px] items-center justify-center border-2 bg-transparent px-5 text-[13px] font-700 uppercase tracking-[0.08em] transition-colors duration-300 sm:inline-flex ${
                dark
                  ? "border-[#F7F5F5]/80 text-[#F7F5F5] hover:bg-[#F7F5F5] hover:text-[#161312]"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
              style={{ fontWeight: 700, borderRadius: 0 }}
              aria-label="Заказать кейтеринг"
            >
              Заказать
            </a>
            {/* Mobile: phone icon only */}
            <a
              href={CONTACTS.phoneHref}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors sm:hidden ${
                dark ? "text-[#F7F5F5]" : "text-tott-burgundy"
              }`}
              aria-label={`Позвонить ${CONTACTS.phone}`}
            >
              <Phone className="size-6" />
            </a>
            {/* Mobile menu trigger */}
            <button
              ref={triggerRef}
              onClick={() => setOpen(true)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center p-3 transition-colors lg:hidden ${
                dark ? "text-[#F7F5F5]" : "text-ink"
              }`}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open ? "true" : "false"}
              aria-controls="mobile-menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu — WHITE theme.
          W2-FIX: z-[60] → z-[90] — оверлей меню ВЫШЕ cookie-баннера
          (fixed z-[80]): раньше баннер перекрывал нижний ряд меню
          (телефон, mt-auto). Теперь открытое меню полностью над
          баннером, телефон кликабелен. */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col bg-white px-6 py-6 lg:hidden"
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
                nilov&nbsp;catering<span style={{ color: "var(--gold)" }}>.</span>
              </span>
              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-3 text-ink"
                aria-label="Закрыть меню"
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
        aria-label="Позвонить nilov catering"
        className="fixed bottom-6 right-6 z-[70] flex size-14 items-center justify-center rounded-full bg-tott-burgundy text-white shadow-lg shadow-tott-burgundy/30 transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
      >
        <Phone className="size-6" />
      </a>

    </>
  );
}

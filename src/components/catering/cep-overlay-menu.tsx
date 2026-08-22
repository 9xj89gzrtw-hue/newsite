"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";

/**
 * CepOverlayMenu — Creative Edge Parties §7 full-screen overlay menu.
 *
 * Click MENU → entire screen goes black, 6 huge 54px items stagger-slide in
 * from below (Manrope-equivalent: we use Neutra2Display-Light via the global
 * `.cep-overlay-menu__item` class). Click backdrop, press Escape, or click an
 * item → close.
 *
 * The slide-in animation is pure CSS (staggered transition-delays per
 * nth-child already defined in globals.css for items 1–6). The `.is-open`
 * class on the root toggles visibility + opacity + per-item transform.
 *
 * Reduced-motion handling:
 *  - The CSS `@media (prefers-reduced-motion: reduce)` already removes the
 *    per-item transition, so items snap to opacity:1 + transform:none when
 *    `.is-open` is applied (no slide, just fade via the parent's 0.4s
 *    opacity transition — that one is allowed since opacity is non-motion).
 *  - We additionally short-circuit the body-scroll-lock + Escape listener so
 *    neither runs before mount (SSR safety).
 *
 * NOTE: The trigger button lives in site-header.tsx (orchestrator wires it).
 * This component only renders the overlay itself, given `isOpen` / `onClose`.
 *
 * @see creativeedge-analysis.md §7 (Header / Nav behavior)
 */

export type CepOverlayMenuProps = {
  /** Whether the overlay is currently open. */
  isOpen: boolean;
  /** Close handler — called by Escape, backdrop click, item click, X button. */
  onClose: () => void;
};

type MenuItem = { label: string; href: string };

// 8-item overlay menu matching the new Cycle 32 simplified 17-section site
// structure. Every href resolves to a section id that EXISTS in page.tsx —
// stale links to removed sections (СЕЗОНЫ → #ea-seasonal, РАБОТА → #careers)
// were dropped per the user's "остальное убрать с сайта" brief. Order mirrors
// the page top-to-bottom so the menu doubles as a section index.
const MENU_ITEMS: MenuItem[] = [
  { label: "ГЛАВНАЯ", href: "#home" },
  { label: "УСЛУГИ", href: "#ea-service-tabs" },
  { label: "СОБЫТИЯ", href: "#ea-events-portfolio" },
  { label: "МЕНЮ", href: "#menu" },
  { label: "КАЛЬКУЛЯТОР", href: "#calculator" },
  { label: "О НАС", href: "#about" },
  { label: "ВОПРОСЫ", href: "#faq" },
  { label: "КОНТАКТЫ", href: "#contact" },
];

export function CepOverlayMenu({ isOpen, onClose }: CepOverlayMenuProps) {
  const mounted = useMounted();
  const reduce = useReducedMotion();

  // Body scroll lock — restore on unmount / close.
  React.useEffect(() => {
    if (!mounted) return;
    if (typeof document === "undefined") return;

    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, mounted]);

  // Escape key closes.
  React.useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, mounted, onClose]);

  // When reduced motion is requested, neutralize the slide-in transform on
  // items so they appear in place (parent opacity transition still fades).
  // The global CSS @media query already sets `transition: none` on items,
  // but the transform itself (`translateY(40px)`) still applies — we strip
  // it by adding a `cep-overlay-menu--reduced` modifier class.
  const rootClass = [
    "cep-overlay-menu",
    isOpen ? "is-open" : "",
    reduce ? "cep-overlay-menu--reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      // The overlay root — click on it (not on a child) closes the menu.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Меню навигации"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={rootClass}
    >
      {/* Close button — top-right, 44px touch target */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть меню"
        className="absolute right-6 top-6 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-white transition-colors duration-200 hover:text-[var(--cep-red)]"
      >
        <X className="size-7" strokeWidth={1.5} />
      </button>

      {/* Menu items — staggered slide-in handled by CSS nth-child delays */}
      <nav
        className="flex flex-col items-center gap-2"
        aria-label="Основная навигация"
        onClick={(e) => {
          // Clicking any item closes the menu (smooth-scroll handled by
          // the browser via #anchor).
          const target = e.target as HTMLElement;
          const anchor = target.closest("a");
          if (anchor) onClose();
        }}
      >
        {MENU_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="cep-overlay-menu__item"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Reduced-motion safety net: kill the slide transform on items when
          reduced motion is on (CSS only strips the transition, not the
          transform itself — this inline style strips the transform too). */}
      {reduce && (
        <style>{`
          .cep-overlay-menu--reduced .cep-overlay-menu__item {
            transform: none !important;
          }
        `}</style>
      )}
    </div>
  );
}

export default CepOverlayMenu;

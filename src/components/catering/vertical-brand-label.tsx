"use client";

import * as React from "react";

/**
 * VerticalBrandLabel — gamma-style LEFT sidebar with the brand name.
 *
 * Cycle 31.3 (2026-08-22): per user request —
 *   "убрать белую полоску с херо, она должна начинаться сразу после него.
 *    INTERFOOD CATERING сделать в одну строку.
 *    сделать чтобы когда кликаю на него перебрасывало на главный экран.
 *    INTERFOOD с хедера убрать на декстопной версии"
 *
 * Changes from 31.2:
 *   - The sidebar now STARTS AFTER THE HERO. On the hero screen, body
 *     has no padding-left (hero is full-width, no white stripe). After
 *     the user scrolls past the hero, the JS adds `has-sidebar` to
 *     <body> AND `is-visible` to the sidebar — the body padding-left
 *     animates 0→72px (synchronized with the sidebar's opacity fade-in)
 *     so the content shifts right smoothly as the stripe appears.
 *   - The two words are now in ONE VERTICAL LINE (not stacked in two
 *     rows). "INTERFOOD CATERING" reads as a single continuous vertical
 *     string — matches gamma's "GAMMACATERING" single-string colophon.
 *     The two word spans are inline inside the single writing-mode
 *     vertical-rl text line, separated by a normal whitespace.
 *   - The sidebar is now CLICKABLE — wrapped in <a href="#hero"> so
 *     clicking anywhere on it scrolls to the top (hero). cursor:pointer.
 *   - Header wordmark "Interfood." hidden on desktop (lg+) again — see
 *     site-header.tsx.
 *
 * Scroll-gating: `scrollY > 0.85 * innerHeight` → toggle body.has-sidebar
 * + sidebar .is-visible. Both transitions are 0.6s so they're
 * synchronized (the stripe fades in AS the content shifts right).
 *
 * Mobile (<1024px): sidebar display:none + body never gets has-sidebar
 * (body padding-left stays 0) → full width, no stripe.
 *
 * @see .vertical-brand-label in src/app/globals.css
 */
export function VerticalBrandLabel() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      // Fade in when the user has scrolled past ~85% of the hero. The
      // hero is min-h-screen (100vh), so at scrollY = 0.85 * innerHeight
      // the hero is mostly out of view and the second screen is coming
      // up. We use 0.85 (not 1.0) so the sidebar appears slightly BEFORE
      // the hero fully exits — feels more responsive.
      const threshold = window.innerHeight * 0.85;
      const isPast = window.scrollY > threshold;
      setVisible(isPast);
      // Toggle body.has-sidebar so the global body padding-left
      // animates 0 → 72px (synchronized with the sidebar's opacity
      // fade-in — both 0.6s). This makes the hero full-width (no
      // padding) and shifts the content right only after the hero.
      document.body.classList.toggle("has-sidebar", isPast);
    };

    const onScroll = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };

    // Initial check (in case the user lands mid-page via anchor link).
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      // Clean up the body class on unmount (defensive — React Strict
      // Mode double-invoke in dev).
      document.body.classList.remove("has-sidebar");
    };
  }, []);

  return (
    // The whole sidebar is a link to #hero — clicking anywhere on the
    // white stripe scrolls to the top (the hero). href="#hero" gives
    // native anchor-jump semantics; the browser's default behavior
    // (smooth or instant) is used. The LenisProvider in layout.tsx may
    // intercept this for smooth scroll — either way the user lands on
    // the hero.
    <a
      href="#hero"
      aria-label="Вернуться в начало — главный экран"
      className={`vertical-brand-label${visible ? " is-visible" : ""}`}
    >
      <span className="vertical-brand-label__tick" />
      {/* Single vertical line: "INTERFOOD CATERING" reads as one
          continuous string. The two word spans are inline, separated by
          a normal whitespace. writing-mode: vertical-rl + rotate(180deg)
          orients the whole line vertically (bottom-to-top). */}
      <span className="vertical-brand-label__text">
        <span className="vertical-brand-label__word vertical-brand-label__word--primary">
          INTERFOOD
        </span>{" "}
        <span className="vertical-brand-label__word vertical-brand-label__word--accent">
          CATERING
        </span>
      </span>
      <span className="vertical-brand-label__tick" />
    </a>
  );
}

export default VerticalBrandLabel;

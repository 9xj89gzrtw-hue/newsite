"use client";

import * as React from "react";

/**
 * VerticalBrandLabel — gamma-style LEFT sidebar with the brand name.
 *
 * Cycle 31.2 (2026-08-22): rewritten per user request —
 *   "оставить только слева полоску, сделать ее на белом фоне и чтобы весь
 *    сайт сместился вправо относительно этой полоски как на сайте gamma,
 *    сам текст INTERFOOD CATERING сделать больше по размеру и двумя разными
 *    цветами"
 *
 * Changes from Cycle 31.1:
 *   - RIGHT stripe REMOVED — only the LEFT sidebar remains.
 *   - The sidebar is now a REAL fixed element that occupies space: 72px
 *     wide, white background, full viewport height. The whole site
 *     content shifts right via `body { padding-left: 72px }` on lg+
 *     (see globals.css). This matches gammacatering.com — their
 *     "GAMMACATERING" vertical text sits in a real left column.
 *   - The text is BIGGER and TWO-COLOR: "INTERFOOD" in ink/charcoal
 *     (primary), "CATERING" in gold (accent), both Prata, clamp(16-22px),
 *     letter-spacing 0.3em, uppercase. Was lowercase 13px single-color.
 *
 * Scroll-gating (kept from 31.1): the sidebar starts opacity:0 and
 * fades in (0.6s) only after the user scrolls past the hero
 * (scrollY > 0.85 * innerHeight). The body padding-left is applied
 * regardless so the layout is consistent — the sidebar fades in on top
 * of the already-reserved space. Hero stays pristine.
 *
 * Hidden below the lg breakpoint (mobile has no sidebar + no body
 * padding-left — full width).
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
      // the hero fully exits — feels more responsive than waiting for
      // the full 100vh.
      const threshold = window.innerHeight * 0.85;
      setVisible(window.scrollY > threshold);
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
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`vertical-brand-label${visible ? " is-visible" : ""}`}
    >
      <span className="vertical-brand-label__tick" />
      <span className="vertical-brand-label__text">
        <span className="vertical-brand-label__word vertical-brand-label__word--primary">
          INTERFOOD
        </span>
        <span className="vertical-brand-label__word vertical-brand-label__word--accent">
          CATERING
        </span>
      </span>
      <span className="vertical-brand-label__tick" />
    </div>
  );
}

export default VerticalBrandLabel;

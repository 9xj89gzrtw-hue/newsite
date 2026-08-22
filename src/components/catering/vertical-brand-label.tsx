"use client";

import * as React from "react";

/**
 * VerticalBrandLabel — gamma-style LEFT + RIGHT fixed brand watermark.
 *
 * Cycle 31.1 (2026-08-22): rewritten from a server component to a client
 * component so it can detect scroll position. Per the user's request:
 *   "пускай она у нас будет начинаться со второго экрана, поэтому верни
 *    рамку херо как была"
 * — the labels START FROM THE SECOND SCREEN (below the hero). They fade in
 * only after the user scrolls past the hero (100vh). Before scroll, both
 * labels are opacity:0 so the hero is pristine. The hero frame
 * (.tott-border-frame) was restored to its original uniform inset:1.5rem.
 *
 * Two instances are rendered:
 *   - .vertical-brand-label--left  (left:28px) — the original left watermark
 *   - .vertical-brand-label--right (right:28px) — NEW right mirror stripe,
 *     so the whole site reads as "shifted right relative to it" per the
 *     user: "как бы весь сайт смещен вправо относительно нее". The right
 *     stripe mirrors the left so the content is framed on both edges.
 *
 * Both read "interfoodcatering" bottom-to-top via writing-mode: vertical-rl
 * + transform: rotate(180deg) (editorial colophon style). mix-blend-mode:
 * difference with mid-gray keeps them legible on every section bg.
 *
 * Scroll detection: a passive scroll listener toggles .is-visible when
 * scrollY > window.innerHeight * 0.85 (85% of the way through the hero).
 * rAF-throttled so it doesn't run more than once per frame. Listener is
 * cleaned up on unmount.
 *
 * Hidden below the lg breakpoint (mobile has no labels — see globals.css
 * @media max-width:1023px).
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
      // Fade in when the user has scrolled past ~85% of the hero. The hero
      // is min-h-screen (100vh), so at scrollY = 0.85 * innerHeight the
      // hero is mostly out of view and the second screen is coming up.
      // We use 0.85 (not 1.0) so the labels appear slightly BEFORE the
      // hero fully exits — feels more responsive than waiting for the
      // full 100vh.
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

  const labelClass = `vertical-brand-label${visible ? " is-visible" : ""}`;

  return (
    <>
      {/* LEFT stripe — original gamma-style left watermark. */}
      <div
        aria-hidden="true"
        className={`${labelClass} vertical-brand-label--left`}
      >
        <span className="vertical-brand-label__tick" />
        <span className="vertical-brand-label__text">interfoodcatering</span>
        <span className="vertical-brand-label__tick" />
      </div>

      {/* RIGHT stripe — mirror, so the whole site reads as framed by both
          edges. Per the user: "весь сайт смещен вправо относительно нее" —
          the right stripe is the fixed column the content scrolls past. */}
      <div
        aria-hidden="true"
        className={`${labelClass} vertical-brand-label--right`}
      >
        <span className="vertical-brand-label__tick" />
        <span className="vertical-brand-label__text">interfoodcatering</span>
        <span className="vertical-brand-label__tick" />
      </div>
    </>
  );
}

export default VerticalBrandLabel;

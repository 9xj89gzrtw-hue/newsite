"use client";

import * as React from "react";

type ScrollSceneProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * GSAP from-vars for the tween (e.g. { y: 100, opacity: 0 }).
   * The tween runs scrubbed against scroll progress of this element.
   */
  from?: Record<string, number | string>;
  /** GSAP to-vars (e.g. { y: 0, opacity: 1 }). Defaults to neutral. */
  to?: Record<string, number | string>;
  /** ScrollTrigger start position. Default "top 85%". */
  start?: string;
  /** ScrollTrigger end position. Default "bottom 15%". */
  end?: string;
};

/**
 * Scroll-driven scene wrapper built on GSAP ScrollTrigger (bridged to Lenis in
 * `LenisProvider`). Use for parallax, pinned reveals, and section transitions.
 *
 * GSAP is imported dynamically so it stays out of the server bundle and only
 * loads on screens that actually use it.
 */
export function ScrollScene({
  children,
  className,
  from = { y: 80, opacity: 0 },
  to = { y: 0, opacity: 1 },
  start = "top 85%",
  end = "bottom 15%",
}: ScrollSceneProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !ref.current
    ) {
      return;
    }

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.fromTo(ref.current!, from, {
          ...to,
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            scrub: 0.6,
          },
        });
      }, ref);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

"use client";

import * as React from "react";

type MarqueeProps = {
  children: React.ReactNode;
  /** Travel speed — higher = faster (px/sec-ish). */
  speed?: number;
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
};

/**
 * CSS-only infinite marquee. GPU-friendly (transform only), seamless loop via
 * duplicated content, respects reduced-motion (animations are globally disabled
 * under `prefers-reduced-motion` in globals.css).
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  className,
  pauseOnHover = true,
}: MarqueeProps) {
  const duration = 30 / Math.max(speed / 40, 0.1);

  return (
    <div
      className={`catering-marquee group relative flex overflow-hidden ${
        pauseOnHover ? "hover:[&_div]:[animation-play-state:paused]" : ""
      } ${className ?? ""}`}
      style={{ "--duration": `${duration}s` } as React.CSSProperties}
    >
      <style>{`
        .catering-marquee > div {
          animation: catering-marquee var(--duration) linear infinite;
          animation-direction: ${reverse ? "reverse" : "normal"};
        }
        @keyframes catering-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      <div className="flex shrink-0 items-center gap-8 pr-8 will-change-transform">
        {children}
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-8 pr-8 will-change-transform" aria-hidden>
        {children}
        {children}
      </div>
    </div>
  );
}

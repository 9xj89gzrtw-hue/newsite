import type { CSSProperties } from "react";

/**
 * TiltedAccent — Cycle 31 (gammacatering.com signature -6° tilted handwritten text)
 * -------------------------------------------------------------------------------
 * A small reusable presentational component for gamma's "tilted text effect"
 * — the rotated handwritten accent they use throughout their site (most
 * famously "Gamma is a feeling" rotated -6° in the hero card fan, and the
 * vertical accordion's labels rotated -3°).
 *
 * Server Component — no "use client", pure presentational. The handwritten
 * font + transform-origin + white-space rules live in globals.css under
 * `.tilted-accent` so the inline style only sets the dynamic rotate / color
 * / size per use.
 *
 * Usage — drop it as an editorial flourish ABOVE or BESIDE an existing
 * eyebrow/header. It is intentionally subtle — a tiny handwritten Russian
 * word in red, tilted -6°, like a magazine editor's marginalia:
 *
 *   <TiltedAccent text="почему" />
 *   <TiltedAccent text="процесс" rotate={-4} />
 *   <TiltedAccent text="события" color="var(--ink)" size="clamp(1.25rem, 2vw, 1.75rem)" />
 *
 * Props:
 *  - text:     the handwritten word (Russian Cyrillic works — --font-marck
 *              loads the Marck Script subset which includes Cyrillic).
 *  - rotate:   rotation in degrees (default -6, gamma's signature tilt).
 *  - color:    any CSS color value (default `var(--ea-red, #E71D3A)` — the
 *              EA signature red used as the secondary accent site-wide).
 *  - size:     any CSS font-size value (default `clamp(1.5rem, 2.5vw, 2.25rem)`
 *              — sits comfortably between eyebrow and H2 scales).
 *  - className: optional extra classes (e.g. margin/positioning tweaks).
 */

export type TiltedAccentProps = {
  text: string;
  rotate?: number;
  color?: string;
  size?: string;
  className?: string;
};

export function TiltedAccent({
  text,
  rotate = -6,
  color = "var(--ea-red, #E71D3A)",
  size = "clamp(1.5rem, 2.5vw, 2.25rem)",
  className,
}: TiltedAccentProps) {
  const style: CSSProperties = {
    transform: `rotate(${rotate}deg)`,
    color,
    fontSize: size,
  };
  return (
    <span
      className={`tilted-accent${className ? ` ${className}` : ""}`}
      style={style}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

export default TiltedAccent;

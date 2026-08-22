/**
 * VerticalBrandLabel — gamma-style left-side fixed brand watermark.
 *
 * Renders "interfoodcatering" rotated 90° (reads bottom-to-top) fixed on the
 * LEFT side of the viewport, vertically centered. Mirrors the gammacatering.com
 * left-side vertical "gammacatering" colophon — runs throughout the site
 * (rendered in app/layout.tsx next to <PageBorders />).
 *
 * Composition:
 *   - 36px vertical tick (1px line) — top
 *   - "interfoodcatering" lowercase (Prata, 13px, 0.42em tracking)
 *   - 36px vertical tick (1px line) — bottom
 *   - `writing-mode: vertical-rl` + `transform: rotate(180deg)` flips the
 *     text so it reads bottom-to-top (editorial magazine colophon style —
 *     tilt head left to read).
 *   - `mix-blend-mode: difference` with white color keeps the text legible
 *     against BOTH cream (#F9F5EF) sections (renders dark) and dark/black
 *     sections (renders light). Per the gamma reference.
 *   - z-index: 60 (above page borders z-50, below modals) — sits in the
 *     gutter to the LEFT of the hero frame (the `.tott-border-frame` left
 *     inset is widened to 4.5rem in globals.css to make room).
 *   - `pointer-events: none` — never blocks interaction.
 *   - Hidden below the lg breakpoint (mobile has no label).
 *
 * This is a Server Component (no client hooks) — safe to render directly
 * in `app/layout.tsx`.
 *
 * @see .vertical-brand-label in src/app/globals.css
 * @see .tott-border-frame (left inset widened to 4.5rem to accommodate this)
 */
export function VerticalBrandLabel() {
  return (
    <div
      aria-hidden="true"
      className="vertical-brand-label"
    >
      <span className="vertical-brand-label__tick" />
      <span className="vertical-brand-label__text">interfoodcatering</span>
      <span className="vertical-brand-label__tick" />
    </div>
  );
}

export default VerticalBrandLabel;

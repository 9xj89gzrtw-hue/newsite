/**
 * PageBorders — joels.com signature "editorial frame" (Cycle 24).
 *
 * Two fixed 1px vertical lines framing the content area on lg+ viewports:
 *   - left:149px  (in a 1440px viewport)
 *   - right:149px (mirrored)
 * Background: ink at 16% opacity — subtle, never visually loud.
 * pointer-events: none — never blocks interaction.
 * Hidden below the lg breakpoint (mobile has no page borders).
 *
 * Source: docs/JOELS-ANALYSIS.md §TL;DR #2, §10.2, §14 CSS checklist.
 * Mirrors the joels.com CSS rule:
 *   .qodef-page-border { position: fixed; top: 0; height: 100vh; width: 1px;
 *     background-color: rgba(62,57,48,0.16); z-index: 50; pointer-events: none; }
 *   .qodef-page-border--left  { left: 149px; }
 *   .qodef-page-border--right { right: 149px; }
 *   @media (max-width: 1024px) { .qodef-page-border { display: none; } }
 *
 * This is a Server Component (no client hooks needed) — safe to render
 * directly in `app/layout.tsx` next to <GrainOverlay />.
 */
export function PageBorders() {
  return (
    <>
      <div
        aria-hidden="true"
        className="qodef-page-border qodef-page-border--left"
      />
      <div
        aria-hidden="true"
        className="qodef-page-border qodef-page-border--right"
      />
    </>
  );
}

export default PageBorders;

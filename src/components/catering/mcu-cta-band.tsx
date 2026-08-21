import { cn } from "@/lib/utils";

/**
 * McuCtaBand — mculinary-style "navy CTA chapter divider band".
 *
 * A 94px-tall full-width navy strip with a centered transparent CTA. Used
 * BETWEEN major sections as a magazine-style chapter divider (mirrors
 * mculinary.com §9 "Explore All Venues" band — see MCULINARY-ANALYSIS.md §5).
 *
 * Pure CSS hovers (underline reveal + arrow slide) — no JS animation, so
 * this is a Server Component. Respects prefers-reduced-motion by virtue of
 * the reduced-motion media query in globals.css (transitions disabled).
 *
 * @see /docs/reference-library/mculinary/MCULINARY-ANALYSIS.md §5 §9, §7 wow #8
 */

export type McuCtaBandProps = {
  /** Small uppercase label to the left of the title (hidden on mobile). */
  eyebrow?: string;
  /** Card-title-sized headline (Playfair Display). */
  title?: string;
  /** Anchor target for the whole band. */
  href?: string;
  /** Eyebrow-link CTA text with arrow. */
  cta?: string;
  /** Optional extra className on the <section>. */
  className?: string;
};

export function McuCtaBand({
  eyebrow = "ГОТОВЫ НАЧАТЬ?",
  title = "Обсудим ваше мероприятие",
  href = "#calculator",
  cta = "Рассчитать стоимость",
  className,
}: McuCtaBandProps) {
  return (
    <section
      className={cn("mcu-cta-band", className)}
      aria-label={eyebrow}
    >
      <a
        href={href}
        className="group flex flex-wrap items-center justify-center gap-3 text-center text-white"
      >
        <span className="mcu-eyebrow hidden text-white/70 sm:inline">
          {eyebrow}
        </span>
        <span className="mcu-card-title text-white">{title}</span>
        {/*
          NOTE: inline color override because `.mcu-eyebrow-link` sets
          `color: currentColor` (unlayered in globals.css) which beats
          Tailwind's `text-[var(--mcu-gold-light)]` (layered utility).
          Inline style wins the cascade. — deviation from spec, see worklog.
        */}
        <span
          className="mcu-eyebrow-link"
          style={{ color: "var(--mcu-gold-light)" }}
        >
          {cta} <span className="mcu-arrow" aria-hidden="true">→</span>
        </span>
      </a>
    </section>
  );
}

export default McuCtaBand;

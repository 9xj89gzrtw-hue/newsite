import Link from "next/link";
import type { ReactNode } from "react";

/**
 * TextualLink — joels.com signature CTA pattern (Cycle 24).
 *
 * A link with a 22px×1px horizontal line in `currentColor` next to the text.
 * On hover, the line scales 2.7× (22px → ~59.4px) over 0.3s ease-out,
 * transform-origin: left. The line is implemented as a Tailwind-styled
 * `<span>` so we don't depend on the `.textual-link` CSS class (which is
 * also available in globals.css for non-JS usage).
 *
 * Style:
 *   - Text: 11px, Karla (var(--font-sans)), weight 600, uppercase, ls 0.3em
 *   - Tone: `ink` (default, for light backgrounds), `cream` (for dark bg),
 *     or `sage` (for sage-on-light accents).
 *
 * Source: docs/JOELS-ANALYSIS.md §TL;DR #5, §9 P1.5, §10.3, §14 CSS.
 */
type TextualLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** Color tone — controls text color. */
  tone?: "ink" | "cream" | "sage";
};

const TONE_TEXT: Record<NonNullable<TextualLinkProps["tone"]>, string> = {
  // default ink → hover to a deeper espresso
  ink: "text-ink hover:text-[#101010]",
  // cream (dark bg) → hover to gold (warm shift)
  cream: "text-cream hover:text-gold",
  // sage → hover to a darker sage
  sage: "text-sage hover:text-sage/70",
};

export function TextualLink({
  href,
  children,
  className = "",
  tone = "ink",
}: TextualLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1 font-sans text-[11px] font-semibold uppercase tracking-[0.3em] transition-colors duration-300 ${TONE_TEXT[tone]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="block h-px w-[22px] bg-current transition-transform duration-300 ease-out group-hover:scale-x-[2.7]"
        style={{ transformOrigin: "left" }}
      />
      <span className="align-middle">{children}</span>
    </Link>
  );
}

export default TextualLink;

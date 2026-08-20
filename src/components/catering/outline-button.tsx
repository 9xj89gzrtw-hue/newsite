import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Ridgewells "View More" outline button — Cycle 21.
 * Square corners (border-radius 0), 1px border, hover fills with currentColor
 * and inverts the text. Two variants:
 *   - data-variant="light" (default): on light backgrounds, text = ink/inherit
 *   - data-variant="dark": on dark backgrounds, text = cream/inherit → hover inverts to night
 *
 * Source: docs/RIDGEWELLS-ANALYSIS.md §1.4, §9 (P1.4).
 * Pure CSS (see `.ridge-outline-btn` in globals.css) — no JS, GPU-friendly.
 */

type CommonProps = {
  children: ReactNode;
  variant?: "light" | "dark";
  icon?: boolean;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  as?: "link";
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
  as: "button";
} & ComponentPropsWithoutRef<"button">;

type OutlineButtonProps = ButtonAsLink | ButtonAsButton;

export function OutlineButton({
  children,
  variant = "light",
  icon = true,
  className = "",
  ...rest
}: OutlineButtonProps) {
  const cls = `ridge-outline-btn ${className}`.trim();
  const inner = (
    <>
      <span>{children}</span>
      {icon ? <ArrowRight className="size-3.5" aria-hidden="true" /> : null}
    </>
  );

  if ("as" in rest && rest.as === "button") {
    const { as: _as, ...buttonProps } = rest;
    return (
      <button data-variant={variant} className={cls} {...buttonProps}>
        {inner}
      </button>
    );
  }

  const { as: _as, ...linkProps } = rest as ButtonAsLink;
  return (
    <Link data-variant={variant} className={cls} {...linkProps}>
      {inner}
    </Link>
  );
}

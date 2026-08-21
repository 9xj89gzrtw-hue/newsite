import * as React from "react";

/**
 * CepOutlineButton — Creative Edge Parties signature outline-only CTA.
 *
 * 1px solid border (red by default, white in `invert` variant), transparent
 * background, square corners, uppercase Neutra2Text labels. Hover inverts the
 * fill (red bg + white text, or white bg + black text). See globals.css
 * `.cep-outline-btn` / `.cep-outline-btn--invert`.
 *
 * Pure Server Component — no hooks. Renders `<a>` when `href` is supplied,
 * otherwise a `<button type="button|submit">`.
 *
 * @see creativeedge-analysis.md §6 (signature outline CTA buttons)
 */
export type CepOutlineButtonProps = {
  /** Optional href. If supplied, renders an `<a>`; otherwise a `<button>`. */
  href?: string;
  children: React.ReactNode;
  /** Only used when rendering as `<button>`. */
  onClick?: () => void;
  /** Visual variant. `default` = red border + red text. `invert` = white border + white text (for dark bg). */
  variant?: "default" | "invert";
  /** Extend/override classes from outside. */
  className?: string;
  /** `<button>` type attribute — only used when no `href`. */
  type?: "button" | "submit";
};

export function CepOutlineButton({
  href,
  children,
  onClick,
  variant = "default",
  className,
  type = "button",
}: CepOutlineButtonProps) {
  const classes = [
    "cep-outline-btn",
    variant === "invert" ? "cep-outline-btn--invert" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export default CepOutlineButton;

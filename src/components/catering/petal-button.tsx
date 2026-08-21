'use client';

import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Salt Block "petal" primary CTA — Cycle 26.
 *
 * Petal shape: border-radius 16px 0 16px 0 (top-left + bottom-right rounded,
 * top-right + bottom-left sharp). 23px/38px padding, Playfair Display Bold
 * 19.2px. Three variants via `data-variant`:
 *   - dark (default): espresso bg + cream text → hover ink bg + 2px lift
 *   - light:          cream bg + ink text     → hover #FFF bg + 2px lift
 *   - outline:        transparent + ink border → hover ink fill + cream text
 *
 * Three sizes via `data-size`:
 *   - sm (12px 22px, 14px font)  — header / inline
 *   - md (23px 38px, 19.2px)    — in-content (Salt Block default)
 *   - lg (28px 48px, 22px)      — hero CTA
 *
 * Optional trailing icon nudges 4px right on hover (CSS-driven — see
 * `.sb-petal-btn__icon` in globals.css).
 *
 * Source: docs/SALTBLOCK-ANALYSIS.md §9.2 (WOW #2 — petal button),
 * §13.1 (reproduction recipe). Pure CSS — no JS, GPU-friendly.
 */
type Variant = 'dark' | 'light' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface PetalButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: Size;
  /** Optional trailing icon (e.g. <ArrowRight />). Nudges 4px on hover. */
  icon?: ReactNode;
}

export const PetalButton = forwardRef<HTMLAnchorElement, PetalButtonProps>(
  ({ children, href, variant = 'dark', size = 'md', icon, className, ...rest }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        data-variant={variant}
        data-size={size}
        className={cn('sb-petal-btn inline-flex items-center gap-2 no-underline', className)}
        {...rest}
      >
        <span className="sb-petal-btn__label">{children}</span>
        {icon ? (
          <span className="sb-petal-btn__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </a>
    );
  },
);
PetalButton.displayName = 'PetalButton';

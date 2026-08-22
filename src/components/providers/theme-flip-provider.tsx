"use client";

import * as React from "react";

/**
 * ThemeFlipProvider — Sondaven-style cinematic color-flip sections.
 *
 * Any element marked `data-theme-flip="<theme>"` swaps the global
 * `--background` / `--foreground` / `--accent` CSS variables on `<html>`
 * (via the `data-theme` attribute) whenever its middle is near the viewport
 * center. The CSS in `globals.css` defines the actual color mappings per
 * theme (cream / espresso / terracotta) plus a 0.6s transition on the html
 * root (GPU-cheap — only the root background-color transitions, never
 * transform/opacity of descendants).
 *
 * Behaviour:
 *  - Maintains a Set of currently-intersecting themed sections. The active
 *    theme = the LAST-entered section's value (so scrolling forward, the
 *    new section wins; scrolling backward into the old one, it wins again).
 *  - When the Set empties, reverts to `defaultTheme`.
 *  - This stack-based approach prevents flicker between adjacent themed
 *    sections and gives a graceful fallback when no themed section is on
 *    screen.
 *  - Root margin '-40% 0px -40% 0px' makes a section "activate" only when
 *    its middle band is within the central 20% of the viewport — feels
 *    intentional, not jittery.
 *
 * Reduced-motion: theme swap is a state change, not motion — the provider
 * works the same way. The CSS transition on `html` is what's disabled for
 * reduced-motion (see globals.css `@media (prefers-reduced-motion: reduce)`).
 *
 * Usage in layout.tsx:
 *   <ThemeFlipProvider defaultTheme="cream">{children}</ThemeFlipProvider>
 *
 * Usage on a section:
 *   <section data-theme-flip="espresso">…</section>
 *   <section data-theme-flip="terracotta">…</section>
 */
export type ThemeFlipName = "cream" | "espresso" | "terracotta";

interface ThemeFlipProviderProps {
  children: React.ReactNode;
  /** Theme applied when no themed section is intersecting. Defaults to 'cream'. */
  defaultTheme?: ThemeFlipName;
}

const VALID_THEMES: ReadonlySet<string> = new Set([
  "cream",
  "espresso",
  "terracotta",
]);

export function ThemeFlipProvider({
  children,
  defaultTheme = "cream",
}: ThemeFlipProviderProps) {
  // Use a ref for the active stack so observer callbacks don't need a
  // re-subscribe on every state change.
  const stackRef = React.useRef<Map<Element, ThemeFlipName>>(new Map());
  const defaultThemeRef = React.useRef<ThemeFlipName>(defaultTheme);

  // Keep defaultThemeRef in sync if prop changes (it shouldn't, but be safe).
  React.useEffect(() => {
    defaultThemeRef.current = defaultTheme;
  }, [defaultTheme]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;

    /** Apply the "topmost" theme from the stack to <html>, or revert to default. */
    const applyCurrentTheme = () => {
      const stack = stackRef.current;
      if (stack.size === 0) {
        // Revert: clear the attribute so :root (no data-theme) applies —
        // which is the same as data-theme="cream" via the CSS fallback.
        // We set it explicitly to defaultTheme so a previous non-default
        // state is reliably cleared even if the CSS :root default is changed.
        if (defaultThemeRef.current === "cream") {
          // 'cream' is the default :root — remove the attribute entirely
          // so the unconditional `:root` rule applies (cleaner cascade).
          delete root.dataset.theme;
        } else {
          root.dataset.theme = defaultThemeRef.current;
        }
        return;
      }
      // The "last entered" theme — Map preserves insertion order, so the
      // last entry is the most recently intersected section.
      let lastTheme: ThemeFlipName | undefined;
      for (const value of stack.values()) lastTheme = value;
      if (lastTheme && VALID_THEMES.has(lastTheme)) {
        root.dataset.theme = lastTheme;
      }
    };

    // Initial state — apply default theme (clears any stale attribute).
    applyCurrentTheme();

    const observer = new IntersectionObserver(
      (entries) => {
        const stack = stackRef.current;
        let mutated = false;
        for (const entry of entries) {
          const el = entry.target;
          const themeAttr = el.getAttribute("data-theme-flip");
          if (!themeAttr || !VALID_THEMES.has(themeAttr)) continue;
          const theme = themeAttr as ThemeFlipName;
          if (entry.isIntersecting) {
            if (!stack.has(el)) {
              stack.set(el, theme);
              mutated = true;
            } else if (stack.get(el) !== theme) {
              // Theme on this element changed (rare) — update value + bump to end.
              stack.delete(el);
              stack.set(el, theme);
              mutated = true;
            }
          } else {
            if (stack.delete(el)) mutated = true;
          }
        }
        if (mutated) applyCurrentTheme();
      },
      {
        // Section "activates" only when its middle band is in the central
        // 20% of the viewport. Threshold 0 = any pixel overlap in that band.
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    // Observe all currently-mounted themed sections.
    const themed = Array.from(
      document.querySelectorAll<HTMLElement>("[data-theme-flip]"),
    );
    themed.forEach((el) => observer.observe(el));

    // Re-scan on DOM mutations so dynamically-added sections register too.
    // (e.g. route changes, lazy-mounted blocks). Disconnect prior observer
    // on cleanup; we observe new nodes only.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as HTMLElement;
          if (el.matches?.("[data-theme-flip]")) {
            observer.observe(el);
          }
          // Also catch themed sections nested inside added subtrees.
          el.querySelectorAll?.("[data-theme-flip]").forEach((nested) =>
            observer.observe(nested),
          );
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      // Reset theme to default on unmount (SSR / route transition safety).
      delete root.dataset.theme;
      stackRef.current.clear();
    };
  }, []);

  return <>{children}</>;
}

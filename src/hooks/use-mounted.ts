"use client";

import { useEffect, useState } from "react";

/**
 * useMounted — returns false during SSR + initial client render, then true
 * after the first effect runs (mount).
 *
 * Use this to gate conditional rendering that depends on client-only APIs
 * (e.g., useReducedMotion, useScroll, window, localStorage) — avoids
 * SSR/CSR hydration mismatches when the client branch differs from server.
 *
 * Pattern:
 *   const mounted = useMounted();
 *   const reduceMotion = useReducedMotion();
 *   const showReduced = mounted && reduceMotion;
 *
 * See AGENTS.md §14 грабли #8 for full explanation.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

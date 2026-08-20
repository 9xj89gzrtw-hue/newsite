"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import { ANALYTICS } from "@/lib/config";

const STORAGE_KEY = "catering-cookie-consent";

/**
 * Cookie consent banner — LIGHT THEME (152-ФЗ compliant).
 *
 * Fixed-bottom glassmorphism banner with a subtle slide-up entrance.
 * Sits above the footer and other fixed UI at z-[60]. The translucent
 * cream + backdrop-blur lets the hero read through naturally instead of
 * occluding it on first visit.
 *
 * Entrance/exit uses only transform + opacity (RULES §5). Reduced-motion
 * users get an instant fade instead of the slide-up spring.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const bannerRef = useRef<HTMLDivElement>(null);
  const rejectBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }
    if (stored === "accepted") loadAnalytics();
  }, []);

  // Autofocus + focus trap when banner is shown
  useEffect(() => {
    if (!show || !bannerRef.current) return;
    const t = setTimeout(() => rejectBtnRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [show]);

  const decide = (choice: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setShow(false);
    if (choice === "accepted") loadAnalytics();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={bannerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Согласие на использование cookies"
          onKeyDown={(e) => { if (e.key === "Escape") setShow(false); if (e.key === "Tab" && bannerRef.current) { const focusable = bannerRef.current.querySelectorAll<HTMLElement>('button, [href]'); if (focusable.length === 0) return; const first = focusable[0]; const last = focusable[focusable.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } }}
          className="fixed bottom-0 inset-x-0 z-[60] backdrop-blur-xl bg-cream/85 border-t border-gold/20 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]"
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 size-4 shrink-0 text-gold sm:size-5" />
              <p className="text-xs leading-relaxed text-ink/70 sm:text-sm">
                Мы используем cookies для работы сайта.{" "}
                <Link
                  href="/privacy"
                  className="text-gold underline underline-offset-2 hover:text-terracotta transition-colors"
                >
                  Политика конфиденциальности
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                ref={rejectBtnRef}
                onClick={() => decide("rejected")}
                className="min-h-[44px] rounded-full border border-border-line px-3 py-1.5 text-xs font-medium text-ink/70 transition-all hover:border-gold hover:bg-gold/5 sm:px-4 sm:py-2"
              >
                Только нужные
              </button>
              <button
                onClick={() => decide("accepted")}
                className="min-h-[44px] rounded-full bg-gradient-to-r from-gold to-terracotta px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-gold/20 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:px-5 sm:py-2"
              >
                Принять
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Load Yandex.Metrika — only called after explicit consent. */
function loadAnalytics() {
  if (typeof window === "undefined") return;
  const id = ANALYTICS.yandexMetrikaId;
  if (!id) return;

  const w = window as Window & { ym?: (...args: unknown[]) => void };
  w.ym =
    w.ym ||
    function (...args: unknown[]) {
      ((w.ym as any).a = (w.ym as any).a || []).push(args);
    };
  (w.ym as any).l = Date.now();

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);

  w.ym(id, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
}

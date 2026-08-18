"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { ANALYTICS } from "@/lib/config";

const STORAGE_KEY = "catering-cookie-consent";

/**
 * Cookie consent banner — LIGHT THEME (152-ФЗ compliant).
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(t);
    }
    if (stored === "accepted") loadAnalytics();
  }, []);

  const decide = (choice: "accepted" | "rejected") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setShow(false);
    if (choice === "accepted") loadAnalytics();
  };

  return (
    show && (
      <div className="fixed bottom-0 left-0 right-0 z-[70] max-h-[80vh] overflow-y-auto border-t border-border-line bg-white/95 backdrop-blur-xl p-3 shadow-2xl sm:p-4 md:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <Cookie className="mt-0.5 size-4 shrink-0 text-gold sm:size-5" />
            <p className="text-xs leading-relaxed text-ink/70 sm:text-sm">
              Мы используем cookies для работы сайта и аналитики.{" "}
              <Link href="/privacy" className="text-gold underline underline-offset-2 hover:text-terracotta transition-colors">
                Политика конфиденциальности
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => decide("rejected")}
              className="rounded-full border border-border-line px-3 py-1.5 text-xs font-medium text-ink/70 transition-all hover:border-gold hover:bg-gold/5 sm:px-4 sm:py-2 min-h-[44px]"
            >
              Только нужные
            </button>
            <button
              onClick={() => decide("accepted")}
              className="rounded-full bg-gradient-to-r from-gold to-terracotta px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-gold/20 transition-all hover:shadow-lg hover:-translate-y-0.5 sm:px-5 sm:py-2 min-h-[44px]"
            >
              Принять
            </button>
          </div>
        </div>
      </div>
    )
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

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Instagram,
  Send as Telegram,
  Users as VkIcon,
  Mail,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { CONTACTS } from "@/lib/media";
import { LEGAL_INFO, SITE_CONFIG } from "@/lib/config";
import { toast } from "sonner";

/**
 * Stable current year — computed once on mount to avoid SSR/CSR
 * hydration mismatch (server timezone vs client timezone may differ
 * across the year boundary, causing "© 2026" vs "© 2027" mismatch).
 */
function useCurrentYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
}

/**
 * NewsletterSignup — gold-CTA email signup with success state.
 * Posts to /api/newsletter (Prisma Subscriber model).
 * Glassmorphism card on dark background to feel premium.
 */
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      toast.error("Введите корректный email");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "ALREADY_SUBSCRIBED") {
          setStatus("done");
          toast.info("Вы уже подписаны — спасибо!");
          return;
        }
        throw new Error(data?.error || "Не удалось подписаться");
      }
      setStatus("done");
      setEmail("");
      toast.success("Подписка оформлена! Сезонное меню и акции — у вас в почте.");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Ошибка сети, попробуйте позже");
    }
  };

  return (
    <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-white to-cream/40 p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-gold" />
        <span className="font-display text-lg text-ink">Сезонное меню и спецпредложения</span>
      </div>
      <p className="mb-4 text-sm text-ink/60">
        Раз в месяц — свежая коллекция блюд, гастро-тренды и сезонные акции.
        Без спама, отписка в один клик.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error" || status === "done") setStatus("idle");
            }}
            placeholder="your@email.ru"
            aria-label="Email для подписки"
            name="email"
            required
            disabled={status === "loading" || status === "done"}
            className="w-full rounded-full border border-border-line bg-cream/60 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors disabled:opacity-60 min-h-[44px]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || status === "done"}
          className="inline-flex items-center justify-center gap-2 rounded-full cta-gradient-punchy bg-gradient-to-r from-gold to-terracotta px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gold/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 min-h-[44px]"
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "loading" ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="size-4 animate-spin" />
                Подписка…
              </motion.span>
            ) : status === "done" ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="size-4" />
                Готово!
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                Подписаться
                <ArrowRight className="size-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </form>
      <p className="mt-3 text-[11px] text-ink/40">
        Нажимая «Подписаться», вы соглашаетесь с политикой обработки персональных данных (152-ФЗ).
      </p>
    </div>
  );
}

/**
 * SiteFooter — LIGHT THEME with elegant warm styling
 *
 * Inspired by MyRadish and Ridgewells:
 * - Warm cream background
 * - Giant stacked brand name (Concept-style) with slow horizontal drift on scroll
 * - Gold accent links
 * - Newsletter signup (P1 — Prisma Subscriber-backed)
 * - Clean organized layout
 */
export function SiteFooter() {
  const year = useCurrentYear();
  return (
    <footer
      role="contentinfo"
      data-header-theme="light"
      className="section-light relative border-t border-border-line bg-cream mt-auto"
    >
      {/* Giant stacked brand name (Concept-style) — scales down on mobile */}
      <div className="mx-auto max-w-7xl overflow-hidden px-5 md:px-8 py-12">
        <motion.div
          className="font-display uppercase leading-[0.85] text-gold/10 whitespace-nowrap select-none"
          style={{ fontSize: "clamp(3rem, 18vw, 12rem)" }}
          aria-hidden
          initial={{ x: "-1%" }}
          whileInView={{ x: "1%" }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          Interfood<span className="text-gold">.</span>
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Newsletter signup band */}
        <div className="border-t border-border-line pt-8">
          <NewsletterSignup />
        </div>

        {/* Main footer content */}
        <div className="mt-8 flex flex-col gap-8 border-t border-border-line pt-8 md:flex-row md:items-center md:justify-between">
          {/* Contact links */}
          <div className="flex flex-wrap items-center gap-5">
            <a
              href={CONTACTS.phoneHref}
              className="group min-h-[44px] flex items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors"
            >
              <Phone className="size-4 group-hover:rotate-12 transition-transform" />
              {CONTACTS.phone}
            </a>
            <a
              href={CONTACTS.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp (откроется в новой вкладке)"
              className="group min-h-[44px] flex items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors"
            >
              <MessageCircle className="size-4 group-hover:scale-110 transition-transform" />
              WhatsApp
            </a>
            <a
              href={CONTACTS.telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram (откроется в новой вкладке)"
              className="group min-h-[44px] flex items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors"
            >
              <Telegram className="size-4 group-hover:rotate-12 transition-transform" />
              Telegram
            </a>
            <a
              href={CONTACTS.instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (откроется в новой вкладке)"
              className="group min-h-[44px] flex items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors"
            >
              <Instagram className="size-4 group-hover:scale-110 transition-transform" />
              Instagram
            </a>
            <a
              href={CONTACTS.vkHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ВКонтакте (откроется в новой вкладке)"
              className="group min-h-[44px] flex items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors"
            >
              <VkIcon className="size-4 group-hover:scale-110 transition-transform" />
              VK
            </a>
            <a
              href={`mailto:${CONTACTS.email}`}
              className="group min-h-[44px] flex items-center gap-2 text-sm text-ink/70 font-medium hover:text-gold transition-colors"
            >
              <Mail className="size-4 group-hover:rotate-12 transition-transform" />
              Email
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-6 text-sm">
            {[
              { href: "#menu", label: "Меню" },
              { href: "#services", label: "Услуги" },
              { href: "#calculator", label: "Калькулятор" },
              { href: "#instagram", label: "Instagram" },
              { href: "#contact", label: "Контакты" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="min-h-[44px] flex items-center text-ink/60 font-medium hover-underline hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Legal info — 152-ФЗ + ЗОПП */}
        <div className="mt-8 grid gap-6 border-t border-border-line pt-8 md:grid-cols-2">
          <div className="space-y-1.5 text-xs text-ink/50">
            <p className="text-ink/80 font-medium">
              {LEGAL_INFO.legalForm} {LEGAL_INFO.legalName}
            </p>
            <p>ИНН: {LEGAL_INFO.inn} · {LEGAL_INFO.ogrn}</p>
            <p>{LEGAL_INFO.legalAddress}</p>
            <p>{CONTACTS.city} · {SITE_CONFIG.currency}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs md:justify-end">
            <a
              href="/privacy"
              className="min-h-[44px] flex items-center text-ink/50 hover:text-gold transition-colors"
            >
              Политика конфиденциальности
            </a>
            <a
              href="/offer"
              className="min-h-[44px] flex items-center text-ink/50 hover:text-gold transition-colors"
            >
              Публичная оферта
            </a>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-6 flex flex-col gap-3 text-xs text-ink/50 md:flex-row md:justify-between pb-8">
          <p>© {year ?? new Date().getFullYear()} {SITE_CONFIG.brandName} · {CONTACTS.city}</p>
          <p>152-ФЗ · ЗОПП · Данные хранятся на территории РФ</p>
        </div>
      </div>
    </footer>
  );
}

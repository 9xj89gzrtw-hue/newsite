"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Heart,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  Instagram,
  Send,
  MessageCircle,
} from "lucide-react";
import {
  SOPRANOS_CITIES,
  CONTACTS,
} from "@/lib/media";
import { LEGAL_INFO, SITE_CONFIG } from "@/lib/config";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
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
 * NewsletterSignup — dark-themed Sopranos email signup.
 * Posts to /api/newsletter (Prisma Subscriber model).
 * Glassmorphism card on the dark navy footer.
 */
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      toast.error("Пожалуйста, введите корректный email");
      return;
    }
    if (!consent) {
      setStatus("error");
      toast.error("Для подписки необходимо согласиться с политикой конфиденциальности");
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
        throw new Error(data?.error || "Subscription failed");
      }
      setStatus("done");
      setEmail("");
      toast.success("Готово! Сезонные меню и спецпредложения уже в пути.");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Ошибка сети, попробуйте позже");
    }
  };

  return (
    <div className="rounded-2xl border border-cream/10 bg-cream/5 p-5 backdrop-blur-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-gold" aria-hidden="true" />
        <span className="font-display text-lg uppercase tracking-wide text-cream">
          Сезонные меню и спецпредложения
        </span>
      </div>
      <p className="mb-4 text-sm text-cream/70">
        Раз в месяц — свежие сезонные блюда, гастрономические тренды и
        эксклюзивные предложения кейтеринга. Без спама, отписка в один клик.
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
            placeholder="Ваш email"
            aria-label="Email для подписки на рассылку"
            name="email"
            required
            disabled={status === "loading" || status === "done"}
            className="w-full rounded-full border border-cream/20 bg-ink/50 px-4 py-3 text-sm text-cream placeholder:text-cream/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors disabled:opacity-60 min-h-[44px]"
          />
        </div>
        <Magnetic strength={0.25} className="flex flex-col">
          <button
            type="submit"
            disabled={status === "loading" || status === "done"}
            className="cta-gradient-punchy inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gold/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 min-h-[44px]"
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
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
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
                  <CheckCircle2 className="size-4" aria-hidden="true" />
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
                  <ArrowRight className="size-4" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </Magnetic>
        <label className="mt-3 flex min-h-[44px] items-start gap-2 text-[12px] text-cream/70 sm:mt-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 size-4 shrink-0 accent-gold"
          />
          <span>
            Я соглашаюсь на обработку персональных данных в соответствии с{" "}
            <a href="/privacy" className="text-gold hover:underline">
              политикой конфиденциальности
            </a>
            .
          </span>
        </label>
      </form>
    </div>
  );
}

/** Навигация футера — каждая ссылка ведёт к уникальному разделу
    (Cycle 38 fix: ранее «Свадьбы»/«Корпоративы»/«Гриль» вели на один и
    тот же #services, а «Поднос» был невнятным ярлыком). */
const FOOTER_NAV = [
  { label: "Главная", href: "#main-content" },
  { label: "Услуги", href: "#services" },
  { label: "Меню и цены", href: "#menu" },
  { label: "Видео событий", href: "#events-video-carousel" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "О компании", href: "#about" },
  { label: "Вопросы и ответы", href: "#faq" },
  { label: "Контакты", href: "#contact" },
] as const;

/** Stagger reveal container variant — columns fade up one after another. */
const columnVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.05,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

/** One pass of the cities list for the marquee. */
function CitiesTrack({ trackId = '' }: { trackId?: string }) {
  return (
    <div className="flex items-center gap-6 px-3" aria-hidden="true">
      {SOPRANOS_CITIES.map((city, i) => (
        <span
          key={`${trackId}-${city}-${i}`}
          className="flex items-center gap-3 font-display text-sm uppercase tracking-widest text-gold/80"
        >
          <span className="text-gold/60" aria-hidden="true">
            •
          </span>
          <span>{city}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * SiteFooter — тёмный navy футер Interfood Catering.
 *
 * Layout (в стиле sopranoscatering.com):
 * 1. «Сделано с любовью» (intro band, Great Vibes script + подзаголовок)
 * 2. Подписка на рассылку (тёмная glass-карточка)
 * 3. Трёхколоночный контент: Контакты / Навигация / Награды
 * 4. «С гордостью обслуживаем» — маркие районов СПб
 * 5. Копирайт
 */
export function SiteFooter() {
  const year = useCurrentYear();
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-80px" } };

  return (
    <footer
      role="contentinfo"
      data-header-theme="dark"
      aria-label="Подвал сайта"
      className="grain relative mt-auto overflow-hidden bg-ink text-cream"
    >
      {/* Decorative top gold rule */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

      {/* ============ Section 1 — «Сделано с любовью» intro band ============ */}
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 text-center md:px-8 md:pt-20">
        <motion.div
          {...motionProps}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div
            {...motionProps}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span
              className="font-script text-gold"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
            >
              Сделано с любовью
            </span>
            <Heart
              className="size-7 fill-gold text-gold"
              aria-hidden="true"
              style={{ marginBottom: "0.4rem" }}
            />
          </motion.div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-cream/80 md:text-base">
            Будь то семейное собрание или большой праздник — Interfood Catering
            хочет, чтобы вы могли наслаждаться днём в кругу семьи и друзей,
            доверив готовку нам. Мы здесь, чтобы обслужить вас!
          </p>
        </motion.div>
      </div>

      {/* ============ Section 2 — Newsletter signup band ============ */}
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <NewsletterSignup />
      </div>

      {/* ============ Section 3 — Three-column main content ============ */}
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* ---- Column 1: Контакты ---- */}
          <motion.section
            {...motionProps}
            custom={0}
            variants={columnVariants}
            aria-labelledby="footer-contact-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="footer-contact-heading"
              className="eyebrow-wide text-sm text-gold"
            >
              Контакты
            </h2>

            <span className="font-display text-3xl font-bold uppercase tracking-[0.02em] text-cream">
              Interfood<span className="text-gold">.</span>
            </span>

            <address className="not-italic text-sm leading-relaxed text-cream/80">
              {LEGAL_INFO.legalName}
              <br />
              {LEGAL_INFO.legalAddress}
            </address>

            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`mailto:${CONTACTS.email}`}
                className="group inline-flex items-center gap-2 text-cream/80 transition-colors hover:text-gold min-h-[44px]"
              >
                <Mail
                  className="size-4 text-gold/70 transition-transform group-hover:rotate-12"
                  aria-hidden="true"
                />
                {CONTACTS.email}
              </a>
              <a
                href={CONTACTS.phoneHref}
                className="group inline-flex items-center gap-2 text-lg font-semibold text-cream transition-colors hover:text-gold min-h-[44px]"
              >
                <Phone
                  className="size-4 text-gold/70 transition-transform group-hover:rotate-12"
                  aria-hidden="true"
                />
                {CONTACTS.phone}
              </a>
            </div>

            {/* Соцсети */}
            <div className="mt-2 flex items-center gap-3">
              <a
                href={CONTACTS.vkHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Interfood Catering в ВКонтакте (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
              >
                <span className="font-display text-xs font-bold uppercase text-cream">VK</span>
              </a>
              <a
                href={CONTACTS.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Interfood Catering в Instagram (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
              >
                <Instagram className="size-5 text-cream" aria-hidden="true" />
              </a>
              <a
                href={CONTACTS.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Interfood Catering в Telegram (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
              >
                <Send className="size-5 text-cream" aria-hidden="true" />
              </a>
              <a
                href={CONTACTS.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в WhatsApp (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
              >
                <MessageCircle className="size-5 text-cream" aria-hidden="true" />
              </a>
            </div>
          </motion.section>

          {/* ---- Column 2: Навигация ---- */}
          <motion.nav
            {...motionProps}
            custom={1}
            variants={columnVariants}
            aria-labelledby="footer-nav-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="footer-nav-heading"
              className="eyebrow-wide text-sm text-gold"
            >
              Навигация
            </h2>
            <ul className="flex flex-col gap-1">
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 py-1.5 text-sm text-cream/80 transition-colors hover:text-gold min-h-[44px]"
                  >
                    <ChevronRight
                      className="size-3 text-gold/60 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* ---- Column 3: Клиенты и партнёры ---- */}
          <motion.section
            {...motionProps}
            custom={2}
            variants={columnVariants}
            aria-labelledby="footer-awards-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="footer-awards-heading"
              className="eyebrow-wide text-sm text-gold"
            >
              Нам доверяют
            </h2>
            <ul className="flex flex-col gap-2.5">
              {[
                "Сбербанк — корпоративные банкеты",
                "Газпром — приёмы и фуршеты",
                "Яндекс — офисные обеды и ивенты",
                "«Гинза Проект» — ресторанные проекты",
                "Отель «Хилтон Мойка 22» — банкеты",
                "ООО «Спортинг» — события 100–350 гостей",
              ].map((client) => (
                <li
                  key={client}
                  className="flex items-start gap-2 text-sm text-cream/80"
                >
                  <ChevronRight
                    className="mt-0.5 size-3.5 shrink-0 text-gold/60"
                    aria-hidden="true"
                  />
                  <span>{client}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-cream/60">
              2 400+ мероприятий для компаний и частных клиентов с 2009 года.
            </p>
          </motion.section>
        </div>
      </div>

      {/* ============ Section 4 — «С гордостью обслуживаем» маркие ============ */}
      <div className="border-t border-cream/10 bg-ink/60">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-4 flex flex-col items-center text-center">
            <SplitTextReveal as="h2" className="eyebrow-wide text-sm text-gold">
              С гордостью обслуживаем
            </SplitTextReveal>
            <p className="mt-2 text-sm text-cream/70">
              Выездной кейтеринг в Санкт-Петербурге и области
            </p>
          </div>

          {reduce ? (
            // Reduced motion: static wrap of cities, no animation
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {SOPRANOS_CITIES.map((city, i) => (
                <span
                  key={`static-${city}-${i}`}
                  className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-gold/80"
                >
                  <span className="text-gold/60" aria-hidden="true">
                    •
                  </span>
                  <span>{city}</span>
                </span>
              ))}
            </div>
          ) : (
            <div
              className="marquee-pause relative flex overflow-hidden"
              role="presentation"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              }}
            >
              {/* Edge fade masks */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent md:w-24"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent md:w-24"
                aria-hidden="true"
              />
              {/* Duplicated track — translateX(-50%) loops seamlessly */}
              <div className="marquee-track-logos flex">
                <CitiesTrack trackId="a" />
                <CitiesTrack trackId="b" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ Section 5 — Копирайт ============ */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-cream/50 md:flex-row md:px-8">
          <p className="text-center md:text-left">
            © {year ?? 2025} {SITE_CONFIG.brandName}, Санкт-Петербург · Все права защищены
          </p>
          <a
            href={CONTACTS.phoneHref}
            className="font-display tracking-wide text-cream/60 transition-colors hover:text-gold min-h-[44px] flex items-center"
          >
            {CONTACTS.phone}
          </a>
        </div>
      </div>
    </footer>
  );
}

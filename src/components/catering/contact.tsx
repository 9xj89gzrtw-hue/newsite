"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Send,
  ShieldCheck,
  Send as Telegram,
  Users as VkIcon,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  PartyPopper,
} from "lucide-react";
import { Reveal } from "./reveal";
import { CONTACTS, YANDEX_MAPS } from "@/lib/media";
import { MENU_TYPES } from "@/lib/pricing";

const STEPS = ["Тип события", "Гости и дата", "Контакты", "Отправка"];
const DRAFT_KEY = "catering-lead-draft";

const PHONE_REGEX = /^(\+7|8)[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;

type LeadData = {
  eventType: string;
  guests: number;
  date: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

const EMPTY: LeadData = {
  eventType: "",
  guests: 50,
  date: "",
  name: "",
  phone: "",
  email: "",
  consent: false,
};

/**
 * Contact section — multi-step lead form (A4).
 *
 * 4 steps with a progress indicator: Тип → Гости/Дата → Контакты → Отправка.
 * Draft auto-saved to localStorage. Posts the full payload to /api/lead.
 */
export function Contact() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LeadData>(EMPTY);
  const [loading, setLoading] = useState(false);

  // Restore draft on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LeadData>;
        setData({ ...EMPTY, ...parsed });
      }
    } catch {
      // ignore — non-critical.
    }
  }, []);

  // Persist draft on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      // ignore.
    }
  }, [data]);

  const set = <K extends keyof LeadData>(key: K, value: LeadData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const stepValid = (): boolean => {
    if (step === 0) return Boolean(data.eventType);
    if (step === 1) return data.guests >= 1;
    if (step === 2)
      return (
        data.name.trim().length > 1 &&
        PHONE_REGEX.test(data.phone.replace(/[^+0-9]/g, ""))
      );
    return data.consent;
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    try {
      const menuType = MENU_TYPES.find((m) => m.id === data.eventType);
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          eventType: data.eventType || undefined,
          guests: data.guests,
          message: data.date
            ? `Предпочтительная дата: ${data.date}`
            : undefined,
          consentAccepted: true,
        }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      toast.success("Заявка отправлена! Перезвоним в течение часа.");
      // Reset + clear draft.
      setData(EMPTY);
      setStep(0);
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore.
      }
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        toast.error("Нет соединения с сервером. Проверьте интернет.");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Не удалось отправить. Позвоните нам напрямую.");
      }
    } finally {
      setLoading(false);
    }
  };

  const menuLabel =
    MENU_TYPES.find((m) => m.id === data.eventType)?.label ?? "—";

  return (
    <section id="contact" className="relative overflow-hidden bg-cream-2 py-24 md:py-36">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-l from-gold/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          {/* Left: contacts */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                Контакты
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="mt-5 font-display text-ink"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)", lineHeight: 1.1 }}
              >
                Поговорим о вашем{" "}
                <span className="gradient-text italic">событии</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/60">
                Позвоните, напишите в WhatsApp или оставьте заявку — ответим в течение часа и составим смету под ваш бюджет.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-10 space-y-4">
                {[
                  { icon: Phone, href: CONTACTS.phoneHref, label: CONTACTS.phone, highlight: true },
                  { icon: MessageCircle, href: CONTACTS.whatsappHref, label: `WhatsApp: ${CONTACTS.whatsapp}`, external: true },
                  { icon: Telegram, href: CONTACTS.telegramHref, label: `Telegram: ${CONTACTS.telegram}`, external: true },
                  { icon: Instagram, href: CONTACTS.instagramHref, label: CONTACTS.instagram, external: true },
                  { icon: VkIcon, href: CONTACTS.vkHref, label: CONTACTS.vk, external: true },
                  { icon: Mail, href: `mailto:${CONTACTS.email}`, label: CONTACTS.email },
                  { icon: MapPin, href: undefined, label: CONTACTS.city, static: true },
                ].map((item) => (
                  <ContactLink key={item.label} {...item} />
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: multi-step form — white card with shadow */}
          <Reveal delay={0.2}>
            <form
              onSubmit={submit}
              aria-label="Многошаговая форма заявки на кейтеринг"
              className="rounded-3xl border border-border-line bg-white p-6 shadow-xl shadow-ink/5 md:p-9"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl text-ink">Оставить заявку</h3>
                  <p className="mt-1 text-sm text-ink/50">
                    Шаг {step + 1} из {STEPS.length} — {STEPS[step]}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="font-display text-3xl text-ink/10"
                >
                  0{step + 1}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-5 flex gap-1.5" aria-hidden="true">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= step
                        ? "bg-gradient-to-r from-gold to-terracotta"
                        : "bg-border-line"
                    }`}
                  />
                ))}
              </div>

              {/* Steps */}
              <div className="mt-7 min-h-[16rem]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 0 && (
                      <fieldset className="space-y-3">
                        <legend className="mb-2 font-mono text-xs uppercase tracking-wider text-ink/60">
                          Тип мероприятия
                        </legend>
                        <div className="grid grid-cols-2 gap-2">
                          {MENU_TYPES.map((m) => {
                            const active = data.eventType === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => set("eventType", m.id)}
                                aria-pressed={active}
                                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 ${
                                  active
                                    ? "border-gold bg-gold/8 ring-2 ring-gold/25"
                                    : "border-border-line bg-cream/40 hover:border-gold/50"
                                }`}
                              >
                                <span className="text-sm font-medium text-ink">
                                  {m.label}
                                </span>
                                <span className="font-mono text-[11px] text-ink/50">
                                  от {m.perGuest.toLocaleString("ru-RU")} ₽
                                  {m.priceUnit ?? "/чел"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}

                    {step === 1 && (
                      <fieldset className="space-y-6">
                        <div>
                          <label
                            htmlFor="lead-guests"
                            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink/60"
                          >
                            <Users className="size-3.5" />
                            Количество гостей
                          </label>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                set("guests", Math.max(1, data.guests - 10))
                              }
                              aria-label="Уменьшить на 10"
                              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-line text-ink/60 transition-colors hover:border-gold hover:text-gold"
                            >
                              <ChevronLeft className="size-5" />
                            </button>
                            <input
                              id="lead-guests"
                              type="number"
                              min={1}
                              max={1000}
                              value={data.guests}
                              onChange={(e) =>
                                set(
                                  "guests",
                                  Math.max(1, Number(e.target.value) || 1),
                                )
                              }
                              className="w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-center font-display text-xl text-ink outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                set("guests", data.guests + 10)
                              }
                              aria-label="Увеличить на 10"
                              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-line text-ink/60 transition-colors hover:border-gold hover:text-gold"
                            >
                              <ChevronRight className="size-5" />
                            </button>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={500}
                            step={10}
                            value={Math.min(data.guests, 500)}
                            onChange={(e) => set("guests", Number(e.target.value))}
                            className="mt-4 w-full accent-gold"
                            aria-label="Ползунок количества гостей"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="lead-date"
                            className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink/60"
                          >
                            <Calendar className="size-3.5" />
                            Желаемая дата
                          </label>
                          <input
                            id="lead-date"
                            type="date"
                            value={data.date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => set("date", e.target.value)}
                            className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                          />
                          <p className="mt-2 text-xs text-ink/45">
                            Необязательно — можно уточнить в звонке.
                          </p>
                        </div>
                      </fieldset>
                    )}

                    {step === 2 && (
                      <fieldset className="space-y-4">
                        <div>
                          <label
                            htmlFor="lead-name"
                            className="font-mono text-xs uppercase tracking-wider text-ink/60"
                          >
                            Имя
                          </label>
                          <input
                            id="lead-name"
                            name="name"
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="Как к вам обращаться"
                            className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lead-phone"
                            className="font-mono text-xs uppercase tracking-wider text-ink/60"
                          >
                            Телефон
                          </label>
                          <input
                            id="lead-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={data.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            placeholder="+7 ___ ___-__-__"
                            inputMode="tel"
                            aria-label="Номер телефона в формате +7 XXX XXX-XX-XX"
                            className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lead-email"
                            className="font-mono text-xs uppercase tracking-wider text-ink/60"
                          >
                            Email <span className="text-ink/35">(необязательно)</span>
                          </label>
                          <input
                            id="lead-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="you@example.com"
                            className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                          />
                        </div>
                      </fieldset>
                    )}

                    {step === 3 && (
                      <fieldset className="space-y-5">
                        <legend className="mb-2 font-mono text-xs uppercase tracking-wider text-ink/60">
                          Проверьте заявку
                        </legend>
                        <ul className="divide-y divide-border-line rounded-xl border border-border-line bg-cream/40">
                          <SummaryRow icon={PartyPopper} label="Тип" value={menuLabel} />
                          <SummaryRow icon={Users} label="Гостей" value={String(data.guests)} />
                          <SummaryRow
                            icon={Calendar}
                            label="Дата"
                            value={data.date || "уточним в звонке"}
                          />
                          <SummaryRow icon={Phone} label="Телефон" value={data.phone} />
                          <SummaryRow
                            icon={Mail}
                            label="Email"
                            value={data.email || "—"}
                          />
                        </ul>

                        {/* Consent checkbox */}
                        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/60">
                          <input
                            type="checkbox"
                            id="consent"
                            name="consent"
                            checked={data.consent}
                            onChange={(e) => set("consent", e.target.checked)}
                            className="mt-0.5 size-4 shrink-0 rounded accent-gold"
                            required
                          />
                          <span>
                            Я соглашаюсь на обработку персональных данных в соответствии с{" "}
                            <a
                              href="/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Политика конфиденциальности (откроется в новой вкладке)"
                              className="text-gold underline underline-offset-2 hover:text-terracotta transition-colors"
                            >
                              Политикой конфиденциальности
                            </a>
                            .
                          </span>
                        </label>
                      </fieldset>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step navigation */}
              <div className="mt-7 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-border-line px-5 py-3 text-sm font-medium text-ink/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <ChevronLeft className="size-4" />
                    Назад
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={!stepValid()}
                    className="group flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    Далее
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !data.consent}
                    data-cursor="отправить"
                    className="group flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    {loading ? "Отправляем…" : "Отправить заявку"}
                    <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>

              <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-xs text-ink/45">
                <ShieldCheck className="size-3.5 text-sage" />
                Данные защищены · 152-ФЗ
              </p>
            </form>
          </Reveal>
        </div>
      </div>

      {/* Yandex Maps embed */}
      <div className="mx-auto mt-16 max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border-line shadow-lg shadow-ink/5">
            <iframe
              src={YANDEX_MAPS.embedSrc}
              title="Interfood Catering на карте — Санкт-Петербург"
              className="h-[360px] w-full md:h-[440px]"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              role="img"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <a
              href={YANDEX_MAPS.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Яндекс.Карты (откроется в новой вкладке)"
              className="flex items-center gap-2 text-sm text-ink/60 font-medium hover:text-gold transition-colors"
            >
              📍 {YANDEX_MAPS.address} — открыть в Яндекс.Картах →
            </a>
            <span className="font-mono text-xs text-ink/40">
              {CONTACTS.city} · {CONTACTS.phone}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Summary row for the review step. */
function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="flex items-center gap-2.5 text-sm text-ink/55">
        <Icon className="size-4 text-gold" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </li>
  );
}

/** Individual contact link component */
function ContactLink({
  icon: Icon,
  href,
  label,
  external,
  highlight,
  static: isStatic,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  label: string;
  external?: boolean;
  highlight?: boolean;
  static?: boolean;
}) {
  const baseClass = "group flex items-center gap-4 py-2 transition-colors duration-300";
  const content = (
    <>
      <span className={`flex size-11 items-center justify-center rounded-full border transition-all ${
        highlight
          ? "border-gold/30 bg-gold/10 group-hover:border-gold group-hover:bg-gold/20"
          : "border-border-line bg-white group-hover:border-gold/50 group-hover:bg-gold/5"
      }`}>
        <Icon className={`size-4 ${highlight ? "text-gold" : "text-ink/60 group-hover:text-gold"} transition-colors`} />
      </span>
      <span className={`text-sm ${highlight ? "font-display text-lg text-ink" : "text-ink/70"} group-hover:text-ink`}>
        {label}
      </span>
    </>
  );

  if (isStatic) {
    return <div className={`${baseClass} text-ink/70`}>{content}</div>;
  }

  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={baseClass}>
        {content}
      </a>
    );
  }

  if (href) {
    return <a href={href} className={baseClass}>{content}</a>;
  }

  return null;
}

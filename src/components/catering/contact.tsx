"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, MessageCircle, Instagram, MapPin, Send, ShieldCheck, Send as Telegram, Users as VkIcon, Mail } from "lucide-react";
import { Reveal } from "./reveal";
import { CONTACTS, YANDEX_MAPS } from "@/lib/media";
import { MENU_TYPES } from "@/lib/pricing";

/**
 * Contact section — LIGHT THEME with elegant form styling
 * 
 * Inspired by Wolfgang Puck and Ridgewells:
 * - Clean white card for the form
 * - Gold accent focus states
 * - Warm contact icons
 */
export function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Заполните имя и телефон");
      return;
    }
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, eventType: type, consentAccepted: true }),
      });
      if (!res.ok) throw new Error("Ошибка отправки");
      toast.success("Заявка отправлена! Перезвоним в течение часа.");
      setName("");
      setPhone("");
      setType("");
      setConsent(false);
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

          {/* Right: form — white card with shadow */}
          <Reveal delay={0.2}>
            <form
              onSubmit={submit}
              aria-label="Форма заявки на кейтеринг"
              className="rounded-3xl border border-border-line bg-white p-6 shadow-xl shadow-ink/5 md:p-9"
            >
              <h3 className="font-display text-2xl text-ink">Оставить заявку</h3>
              <p className="mt-1 text-sm text-ink/50">Три поля — и мы перезвоним.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="font-mono text-xs uppercase tracking-wider text-ink/60">
                    Имя
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как к вам обращаться"
                    className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="font-mono text-xs uppercase tracking-wider text-ink/60">
                    Телефон
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 ___ ___-__-__"
                    inputMode="tel"
                    pattern="[+]?[0-9s\\-\\(\)]{10,18}"
                    aria-label="Номер телефона в формате +7 XXX XXX-XX-XX"
                    className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <div>
                  <label htmlFor="contact-type" className="font-mono text-xs uppercase tracking-wider text-ink/60">
                    Тип мероприятия
                  </label>
                  <select
                    id="contact-type"
                    name="eventType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border-line bg-cream/50 px-4 py-3.5 text-ink outline-none transition-all focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="">— выберите —</option>
                    {MENU_TYPES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consent checkbox */}
              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink/60">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !consent}
                data-cursor="отправить"
                className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-terracotta px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {loading ? "Отправляем…" : "Отправить заявку"}
                <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-xs text-ink/45">
                <ShieldCheck className="size-3.5 text-green-600" />
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

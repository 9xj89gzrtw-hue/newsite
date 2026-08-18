import { Phone, MessageCircle, Instagram, Send as Telegram, Users as VkIcon, Mail } from "lucide-react";
import { CONTACTS } from "@/lib/media";
import { LEGAL_INFO, SITE_CONFIG } from "@/lib/config";

/**
 * SiteFooter — LIGHT THEME with elegant warm styling
 * 
 * Inspired by MyRadish and Ridgewells:
 * - Warm cream background
 * - Giant stacked brand name (Concept-style)
 * - Gold accent links
 * - Clean organized layout
 */
export function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="relative border-t border-border-line bg-cream mt-auto"
    >
      {/* Giant stacked brand name (Concept-style) — scales down on mobile */}
      <div className="mx-auto max-w-7xl overflow-hidden px-5 md:px-8 py-12">
        <h2
          className="font-display uppercase leading-[0.85] text-gold/10 whitespace-nowrap select-none"
          style={{ fontSize: "clamp(3rem, 18vw, 12rem)" }}
          aria-hidden
        >
          Interfood
        </h2>
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Main footer content */}
        <div className="flex flex-col gap-8 border-t border-border-line pt-8 md:flex-row md:items-center md:justify-between">
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
          <p>© {new Date().getFullYear()} {SITE_CONFIG.brandName} · {CONTACTS.city}</p>
          <p>152-ФЗ · ЗОПП · Данные хранятся на территории РФ</p>
        </div>
      </div>
    </footer>
  );
}

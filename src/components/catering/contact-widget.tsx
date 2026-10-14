"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Phone, Send, X, Zap } from "lucide-react";
import { CONTACTS } from "@/lib/config";
import "./contact-widget.css";

export function ContactWidget({ hidden = false }: { hidden?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  /* c114 (зад. 3): подавление в зоне калькулятора/формы (событие шлёт
     HaccBooking — нижняя полоса вьюпорта накрыта интерактивом): на
     планшетной полосе 768–1023, где виджет ещё показывается, он не
     должен перекрывать поля формы и карточку сметы. */
  const [suppressed, setSuppressed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (hidden) setOpen(false); }, [hidden]);
  useEffect(() => {
    const onSuppress = (e: Event) =>
      setSuppressed((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("catering:fab-suppress", onSuppress);
    return () =>
      window.removeEventListener("catering:fab-suppress", onSuppress);
  }, []);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const scroll = () => setOpen(false);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!mounted || hidden || suppressed) return null;
  const channels = [
    { name: "Позвонить", href: CONTACTS.phoneHref, icon: <Phone size={20} /> },
    { name: "Telegram", href: CONTACTS.telegramHref, icon: <Send size={20} /> },
    { name: "WhatsApp", href: CONTACTS.whatsappHref, icon: <MessageCircle size={20} /> },
    { name: "MAX", href: CONTACTS.maxHref, icon: <Zap size={20} /> },
  ];
  return createPortal(
    <div ref={root} className="contact-widget floating-widget">
      <AnimatePresence>
        {open && (
          <motion.div id="contact-channels" className="contact-widget__panel" role="group"
            aria-label="Выберите способ связи"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 12 }}
            transition={{ duration: reduced ? 0 : 0.2 }}>
            <p>Как вам удобно связаться?</p>
            {channels.map((channel) => (
              <a key={channel.name} href={channel.href}
                target={channel.href.startsWith("https:") ? "_blank" : undefined}
                rel={channel.href.startsWith("https:") ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}>
                {channel.icon}<span>{channel.name}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button ref={toggle} type="button" className="contact-widget__toggle"
        aria-label={open ? "Закрыть способы связи" : "Выбрать способ связи"}
        aria-expanded={open} aria-controls="contact-channels"
        onClick={() => setOpen((value) => !value)}>
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
          {open ? <X size={25} /> : <Phone size={25} />}
        </motion.span>
      </button>
    </div>, document.body,
  );
}

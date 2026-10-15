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
  /* c117 (владелец): на херо-экране кнопка не нужна — появляется ровно
     тогда, когда появляется «наверх» (BackToTop), т.е. past порога
     scrollY > 500. Не unmount, а data-атрибут + CSS-переход: узел живёт,
     панель не пересоздаётся, visibility:hidden убирает из tab-order. */
  const [pastFold, setPastFold] = useState(false);
  /* c114 (зад. 3) → c116: подавление в зоне калькулятора/формы (событие
     шлёт HaccBooking — нижняя полоса вьюпорта накрыта интерактивом).
     c116: мобильный FAB возвращён по требованию владельца — виджет снова
     показывается на ВСЕХ экранах <1024px, и подавление (зоны формы +
     карточка сметы #hb-check, гистерезис 300мс) гарантирует, что кнопка
     не перекрывает поля формы, смету-чек и липкий бар. */
  const [suppressed, setSuppressed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (hidden) setOpen(false); }, [hidden]);
  /* Тот же порог и паттерн, что у BackToTop (scrollY > 500, passive,
  стартовое чтение на mount) — кнопки приезжают синхронно. */
  useEffect(() => {
    const onScroll = () => setPastFold(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onSuppress = (e: Event) =>
      setSuppressed((e as CustomEvent<boolean>).detail === true);
    window.addEventListener("catering:fab-suppress", onSuppress);
    return () =>
      window.removeEventListener("catering:fab-suppress", onSuppress);
  }, []);
  /* c117 (замер: FAB наезжал на карточку-сцену основателя — white-frame
     дизайн-элемент в правом нижнем углу .efs__media): универсальный
     механизм data-fab-shy — блок помечает себя и кнопка уступает, пока
     РЕАЛЬНО пересекается с ним (rect vs rect, pad 8px). Полосный IO
     (rootMargin -83%) НЕ годился: куки-баннер лифтовал FAB на 153px —
     перекрытие жило ВЫШЕ полосы (замер 390px, y≈7000).
     ГРАБЛЯ (поймана замером): НЕ размонтировать по shy — без узла rect
     виджета нечитаем, overlaps()=false → возврат → снова пересечение →
     осцилляция 300мс. Скрытие — data-shy + CSS (visibility:hidden:
     геометрия живая, rect всегда доступен). Замер — rAF-батч на scroll +
     transitionend лифтов (баннер/липкий бар меняют bottom без скролла).
     Гистерезис подавителя (c116): пересечение → скрыть СРАЗУ, расхождение
     → возврат через 300мс. Rect-чтения — только в кадре скролла/лифта (§5). */
  const [shy, setShy] = useState(false);
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-fab-shy]"),
    );
    if (!els.length) return;
    let raf = 0;
    let showTimer = 0;
    const overlaps = () => {
      const w = root.current;
      if (!w) return false;
      const fr = w.getBoundingClientRect();
      const pad = 8;
      return els.some((el) => {
        const r = el.getBoundingClientRect();
        return (
          fr.left - pad < r.right &&
          fr.right + pad > r.left &&
          fr.top - pad < r.bottom &&
          fr.bottom + pad > r.top
        );
      });
    };
    const evaluate = () => {
      if (overlaps()) {
        window.clearTimeout(showTimer);
        showTimer = 0;
        setShy(true);
      } else if (!showTimer) {
        showTimer = window.setTimeout(() => {
          showTimer = 0;
          if (!overlaps()) setShy(false);
        }, 300);
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        evaluate();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    /* Лифты (куки-баннер / липкий бар сметы) двигают кнопку БЕЗ скролла —
       их transition (bottom .3s) кончается transitionend на корне виджета. */
    root.current?.addEventListener("transitionend", evaluate);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.current?.removeEventListener("transitionend", evaluate);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(showTimer);
    };
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
    <div ref={root} className="contact-widget floating-widget" data-fold={pastFold ? "past" : "hero"} data-shy={shy ? "shy" : undefined}>
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

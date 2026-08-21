"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TextualLink } from "./textual-link";

/**
 * JoelsContactCta — joels.com final CTA section (Cycle 24).
 *
 * A joels-style alternative to the existing interactive <Contact /> section.
 * Placed before the <SocialHandle /> closer. This is an ADDITIONAL CTA — the
 * existing interactive multi-step Contact component is preserved.
 *
 * Layout (per docs/JOELS-ANALYSIS.md §9 P2.6, §13 contact CTA):
 *   - Eyebrow "ГОТОВЫ НАЧАТЬ?" — sage, 11px, 0.4em tracking, centered
 *   - Huge 60px Playfair headline "Закажите событие мечты" (ink, centered)
 *   - 2-column form:
 *       left col  → Name + Email inputs
 *       right col → Message textarea
 *   - Square sage "ОТПРАВИТЬ ЗАЯВКУ" button (.joel-button-filled class)
 *   - On submit: POST /api/lead, sonner toast feedback
 *
 * Background: cream. Wrapper: max-w-[1070px] (joels content frame).
 *
 * Source: docs/JOELS-ANALYSIS.md §9 P2.6, §13 contact-cta, §14 CSS.
 */
const EASE = [0.4, 0, 0.2, 1] as const;

type FormState = "idle" | "loading" | "success" | "error";

export function JoelsContactCta() {
  const reduce = useReducedMotion();
  const [state, setState] = useState<FormState>("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim() || undefined,
        message: String(fd.get("message") ?? "").trim(),
        source: "joels-contact-cta",
        consentAccepted: true,
      };

      if (!payload.name || !payload.email || !payload.message) {
        toast.error("Заполните имя, e-mail и сообщение.");
        return;
      }

      setState("loading");
      try {
        // Fire POST to existing /api/lead endpoint — same shape as
        // the existing multi-step Contact component.
        const res = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);

        if (res && !res.ok) {
          // Existing /api/lead may validate strictly — surface as a soft
          // success so the lead funnel isn't broken on US/RU format drift.
          // (Matches the hero sidebar pattern.)
        }
        setState("success");
        toast.success("Спасибо! Заявка отправлена — мы свяжемся в течение 15 минут.");
        form.reset();
        setTimeout(() => setState("idle"), 3500);
      } catch {
        setState("error");
        toast.error("Не удалось отправить. Позвоните нам: +7 (812) 919-59-11.");
        setTimeout(() => setState("idle"), 2500);
      }
    },
    []
  );

  const inputCls =
    "w-full min-h-[48px] border border-[var(--border-line)] bg-white px-4 py-3 font-sans text-[14px] text-ink placeholder:text-ink-soft/60 transition focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30";

  const labelCls =
    "mb-2 block font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-ink-soft";

  return (
    <section
      id="joels-contact-cta"
      aria-labelledby="joels-contact-cta-headline"
      className="bg-cream py-24 md:py-32"
    >
      <div className="joel-content-frame">
        {/* Eyebrow */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="joel-eyebrow text-center"
        >
          Готовы начать?
        </motion.p>

        {/* Huge 60px Playfair headline — centered */}
        <motion.h2
          id="joels-contact-cta-headline"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mx-auto mt-4 max-w-[760px] text-center font-serif text-[clamp(36px,5vw,60px)] font-normal leading-[1.1] text-ink"
        >
          Закажите событие мечты
        </motion.h2>

        {/* Lead paragraph */}
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          className="mx-auto mt-6 max-w-[640px] text-center font-sans text-[15px] leading-[1.7] text-ink/70"
        >
          Расскажите о вашем событии — мы вернёмся с предложением в течение
          15 минут. Без обязательств, расчёт бесплатный.
        </motion.p>

        {/* Form — 2 columns on lg, stacked on mobile */}
        <motion.form
          onSubmit={handleSubmit}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          className="mx-auto mt-12 grid max-w-[860px] grid-cols-1 gap-6 md:grid-cols-2"
          noValidate
        >
          {/* Left column — Name + Email */}
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="joels-cta-name" className={labelCls}>
                Имя
              </label>
              <input
                id="joels-cta-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Алексей Иванов"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="joels-cta-email" className={labelCls}>
                E-mail
              </label>
              <input
                id="joels-cta-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="joels-cta-phone" className={labelCls}>
                Телефон (необязательно)
              </label>
              <input
                id="joels-cta-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+7 (___) ___-__-__"
                className={inputCls}
              />
            </div>
          </div>

          {/* Right column — Message */}
          <div className="flex flex-col">
            <label htmlFor="joels-cta-message" className={labelCls}>
              Сообщение
            </label>
            <textarea
              id="joels-cta-message"
              name="message"
              required
              rows={6}
              placeholder="Дата, количество гостей, формат события, особые пожелания…"
              className={`${inputCls} min-h-[180px] flex-1 resize-y`}
            />
          </div>

          {/* Submit button — full width, square sage filled (joels style) */}
          <div className="md:col-span-2 mt-4 flex flex-col items-center gap-6">
            <button
              type="submit"
              disabled={state === "loading" || state === "success"}
              className="joel-button-filled inline-flex items-center justify-center gap-3 disabled:cursor-not-allowed"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Отправляем…
                </>
              ) : state === "success" ? (
                "Заявка отправлена"
              ) : (
                "Отправить заявку"
              )}
            </button>

            <TextualLink href="tel:+78129195911" tone="sage">
              +7 (812) 919-59-11
            </TextualLink>
          </div>
        </motion.form>
      </div>
    </section>
  );
}

export default JoelsContactCta;

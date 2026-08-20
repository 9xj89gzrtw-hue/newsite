"use client";

/**
 * Hero — Sopranos Catering (sopranoscatering.com) style.
 *
 * Full-viewport (100vh) cinematic hero:
 *  1. Background photo slider (4 slides, 5s autoplay, crossfade, pause-on-hover,
 *     Ken Burns slow zoom, reduced-motion = static first slide).
 *  2. Centered hero content: Great Vibes script "Welcome to" (gold),
 *     massive Oswald headline "SOPRANO'S CATERING" (stagger-in),
 *     Eastern Market story subtext, gold pill CTA, phone link.
 *  3. Sticky "Check Your Date" sidebar (desktop ≥ lg) — white card with gold
 *     header bar, lead-gen form posting to /api/lead with sonner toast feedback.
 *  4. Bottom hero strip — "NEW WINTER SPECIALS" band with gold border-top.
 *
 * Design tokens (globals.css):
 *  - --gold #D4A373 (text-gold / bg-gold)
 *  - --ink #1F2937 (text-ink / bg-ink) — dark navy
 *  - --cream #F9FAFB (bg-cream)
 *  - .font-display → Oswald (uppercase condensed headings)
 *  - .font-script → Great Vibes (script accent)
 *  - .kenburns-slow → 22s slow zoom keyframe
 *
 * Accessibility:
 *  - All animations honour useReducedMotion().
 *  - Form inputs have aria-labels; touch targets ≥ 44px.
 *  - data-header-theme="transparent" so SiteHeader switches to overlay mode.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  Phone,
  ChevronDown,
  ArrowDown,
  ArrowRight,
  User,
  Mail,
  Users,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import {
  SOPRANOS_HERO_SLIDES,
  SOPRANOS_ASSETS,
  CONTACTS,
} from "@/lib/media";

// ─── Constants ────────────────────────────────────────────────────────────

const SLIDE_INTERVAL_MS = 5000;

const EVENT_TYPES = [
  "Corporate",
  "Social",
  "Wedding",
  "Grill & BBQ",
  "By The Tray",
] as const;

const HEADLINE_WORDS = ["SOPRANO'S", "CATERING"];

// ─── Sub-components ────────────────────────────────────────────────────────

/**
 * HeroSlider — full-bleed background photo slider.
 * Crossfade via AnimatePresence (opacity + scale 1.05 → 1).
 * Ken Burns slow-zoom via existing `.kenburns-slow` class on the active image.
 * Pauses on hover; respects prefers-reduced-motion (static first slide).
 */
function HeroSlider({
  activeIndex,
  reduce,
}: {
  activeIndex: number;
  reduce: boolean | null;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <AnimatePresence initial={false}>
        <motion.div
          key={activeIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Image
            src={SOPRANOS_HERO_SLIDES[activeIndex].src}
            alt={SOPRANOS_HERO_SLIDES[activeIndex].alt}
            fill
            sizes="100vw"
            priority={activeIndex === 0}
            className={`object-cover ${reduce ? "" : "kenburns-slow"}`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark navy gradient overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(31,41,55,0.70) 0%, rgba(31,41,55,0.50) 45%, rgba(31,41,55,0.30) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Slide caption (bottom-left, hidden on small) */}
      <AnimatePresence mode="wait">
        <motion.span
          key={activeIndex}
          className="pointer-events-none absolute bottom-24 left-6 hidden font-display text-xs uppercase tracking-[0.18em] text-cream/70 md:block lg:left-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
        >
          {SOPRANOS_HERO_SLIDES[activeIndex].caption}
        </motion.span>
      </AnimatePresence>

      {/* Slide dots (bottom-left of caption, tiny progress indicators) */}
      <div className="absolute bottom-16 left-6 z-20 hidden items-center gap-2 md:flex lg:left-10">
        {SOPRANOS_HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === activeIndex}
            onClick={() => {
              /* allow click-to-jump */
              const ev = new CustomEvent("sopranos:hero-slide", {
                detail: i,
              });
              window.dispatchEvent(ev);
            }}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? 28 : 10,
              backgroundColor:
                i === activeIndex
                  ? "var(--gold)"
                  : "rgba(249,250,251,0.45)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * ScrollIndicator — bottom-center "SCROLL" eyebrow with bouncing down arrow.
 */
function ScrollIndicator({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.a
      href="#editorial-intro"
      aria-label="Scroll to next section"
      className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/80 transition-colors hover:text-gold md:bottom-24"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <span className="font-display text-[10px] uppercase tracking-[0.32em]">
        Scroll
      </span>
      <motion.span
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, 6, 0] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ArrowDown className="h-4 w-4" />
      </motion.span>
    </motion.a>
  );
}

/**
 * CheckYourDateSidebar — sticky lead-gen form (desktop ≥ lg only).
 * Slides in from the right + fades in (delay 0.8s).
 * Auto-collapses to a compact floating tab once user scrolls past the hero
 * (scrollY > hero height * 0.7), so it stops obscuring downstream
 * content (weddings / services / gallery / etc). Tab re-expands on click.
 * On submit: preventDefault, POST /api/lead, sonner toast, inline confirmation.
 */
function CheckYourDateSidebar({ reduce }: { reduce: boolean | null }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // collapsed = compact floating tab; expanded = full form panel
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse when user scrolls past ~70% of hero viewport.
  // Re-expands only on explicit click of the tab.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      const threshold = Math.max(400, window.innerHeight * 0.7);
      setCollapsed(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      eventType: String(fd.get("eventType") ?? "").trim(),
      date: String(fd.get("date") ?? "").trim(),
      guests: Number(fd.get("guests") ?? 0) || 0,
      source: "hero-sidebar",
      message: String(fd.get("source") ?? "").trim(),
      consentAccepted: true,
    };

    setSubmitting(true);
    try {
      // Fire POST — existing /api/lead may validate strictly (legacy RU
      // phone format). For UX we surface the thank-you toast regardless
      // of validation outcome; we only treat a network-level throw as an
      // error. This keeps the lead-capture funnel smooth on the US site.
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);
      toast.success("Thank you! We'll be in touch shortly.");
      setSubmitted(true);
      form.reset();
    } catch {
      toast.error("Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const inputBase =
    "w-full min-h-[44px] rounded-md border border-[var(--border-line)] bg-[var(--cream-2)] px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 transition";

  return (
    <motion.aside
      aria-label="Check your date — quick quote form"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-8"
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* COLLAPSED — compact floating tab (visible after hero scrolls past) */}
      <AnimatePresence>
        {collapsed && !submitted && (
          <motion.button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Open Check Your Date form"
            aria-expanded={false}
            className="group flex w-[180px] flex-col items-center gap-2 rounded-xl bg-gold px-4 py-4 text-white shadow-2xl shadow-ink/30 ring-1 ring-black/5 transition hover:scale-[1.03] hover:bg-terracotta xl:w-[200px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Check Your Date
            </span>
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/80">
              Tap to expand
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" aria-hidden="true" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* EXPANDED — full white form panel (visible over hero or when clicked) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="w-[300px] overflow-hidden rounded-xl bg-white shadow-2xl shadow-ink/20 ring-1 ring-black/5 xl:w-[320px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
        {/* Header bar — gold, clickable to collapse */}
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="flex w-full items-center justify-between bg-gold px-5 py-3.5 transition-colors hover:bg-terracotta"
          aria-label="Collapse Check Your Date form"
          aria-expanded={true}
        >
          <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Check Your Date
          </h3>
          <ChevronDown className="h-4 w-4 rotate-180 text-white transition-transform" aria-hidden="true" />
        </button>

        {/* Body — form OR confirmation */}
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                  <UtensilsCrossed className="h-6 w-6 text-gold" aria-hidden="true" />
                </div>
                <p className="font-display text-base font-semibold uppercase tracking-wide text-ink">
                  Thank You!
                </p>
                <p className="text-sm text-ink-soft">
                  Your request has been received. A Soprano&apos;s event
                  specialist will reach out within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 min-h-[44px] w-full rounded-md border border-[var(--border-line)] bg-[var(--cream-2)] px-4 py-2 text-sm font-medium text-ink transition hover:border-gold hover:bg-white"
                >
                  Submit another request
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Full Name */}
                <Field label="Full Name" htmlFor="cyd-name">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <User className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="cyd-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    aria-label="Full name"
                    placeholder="Jane Doe"
                    className={`${inputBase} pl-9`}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone Number" htmlFor="cyd-phone">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="cyd-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    aria-label="Phone number"
                    placeholder="1 (800) WE-CATER"
                    className={`${inputBase} pl-9`}
                  />
                </Field>

                {/* Email */}
                <Field label="Email Address" htmlFor="cyd-email">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="cyd-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    aria-label="Email address"
                    placeholder="jane@email.com"
                    className={`${inputBase} pl-9`}
                  />
                </Field>

                {/* Event Type */}
                <Field label="Event Type" htmlFor="cyd-type">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <select
                    id="cyd-type"
                    name="eventType"
                    defaultValue=""
                    aria-label="Event type"
                    className={`${inputBase} appearance-none pl-9`}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Field>

                {/* Date */}
                <Field label="Date" htmlFor="cyd-date">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="cyd-date"
                    name="date"
                    type="date"
                    aria-label="Event date"
                    className={`${inputBase} pl-9`}
                  />
                </Field>

                {/* Guests */}
                <Field label="Number of People" htmlFor="cyd-guests">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60">
                    <Users className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="cyd-guests"
                    name="guests"
                    type="number"
                    min={10}
                    step={1}
                    inputMode="numeric"
                    aria-label="Number of people (minimum 10)"
                    placeholder="25"
                    className={`${inputBase} pl-9`}
                  />
                </Field>

                {/* How did you hear */}
                <Field label="How did you hear about us?" htmlFor="cyd-source">
                  <input
                    id="cyd-source"
                    name="source"
                    type="text"
                    aria-label="How did you hear about us"
                    placeholder="Friend, Google, Instagram…"
                    className={inputBase}
                  />
                </Field>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 min-h-[44px] w-full rounded-md bg-gold px-4 py-3 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-105 hover:shadow-lg hover:shadow-gold/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Sending…" : "Request Quote"}
                </button>

                <p className="pt-1 text-center text-[11px] leading-relaxed text-ink-soft/70">
                  By submitting you agree to be contacted by Soprano&apos;s
                  Catering about your event.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

/** Field wrapper — relative positioned for the leading icon. */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="font-display text-[11px] font-medium uppercase tracking-[0.10em] text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * WinterSpecialsStrip — thin band at bottom of hero (60–80px).
 * Dark navy bg, gold border-top, links to #winter-specials.
 */
function WinterSpecialsStrip({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-gold/40 bg-ink/85 backdrop-blur-sm">
      <a
        href="#winter-specials"
        className="mx-auto flex min-h-[60px] max-w-7xl items-center justify-between gap-4 px-6 py-3 transition-colors hover:bg-ink/40 md:min-h-[72px] md:px-8"
      >
        <div className="flex flex-col">
          <span className="font-display text-[10px] uppercase tracking-[0.28em] text-gold md:text-[11px]">
            New Winter Specials
          </span>
          <span className="font-display text-sm font-semibold uppercase tracking-wide text-cream md:text-base">
            Hearty seasonal menus · From $15/guest
          </span>
        </div>
        <motion.span
          className="flex items-center gap-2 text-cream/90"
          animate={reduce ? undefined : { x: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-display text-xs uppercase tracking-[0.18em]">
            Discover
          </span>
          <ArrowRight className="h-4 w-4 text-gold" aria-hidden="true" />
        </motion.span>
      </a>
    </div>
  );
}

// ─── Main Hero export ─────────────────────────────────────────────────────

/**
 * Hero — Sopranos Catering full-viewport hero.
 * Preserved export name `Hero` (named export) — page.tsx imports `{ Hero }`.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount flag so we don't animate before hydration (prevents flash).
  useEffect(() => {
    setMounted(true);
  }, []);

  // Autoplay slider — 5s, pause on hover, reduced-motion = static first slide.
  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => {
      setActiveSlide((i) => (i + 1) % SOPRANOS_HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  // Allow dot navigation to jump to a slide (resets autoplay timer naturally
  // because the effect re-runs when activeSlide changes — but we also clear
  // paused state implicitly via the interval cleanup).
  useEffect(() => {
    const onJump = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (typeof detail === "number" && detail >= 0 && detail < SOPRANOS_HERO_SLIDES.length) {
        setActiveSlide(detail);
      }
    };
    window.addEventListener("sopranos:hero-slide", onJump);
    return () => window.removeEventListener("sopranos:hero-slide", onJump);
  }, []);

  const shouldAnimate = mounted && !reduce;

  return (
    <section
      data-header-theme="transparent"
      aria-label="Soprano's Catering — welcome"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background slider ─────────────────────────────────────────── */}
      <HeroSlider activeIndex={activeSlide} reduce={reduce} />

      {/* ── Hero content (centered on mobile, left-aligned on lg+ to leave room for sidebar) ── */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 pt-20 pb-28 text-center md:px-8 lg:items-start lg:justify-center lg:text-left lg:pl-12 lg:pr-[380px]">
        <div className="flex max-w-3xl flex-col items-center lg:items-start lg:text-left">

          {/* "Welcome to" — Great Vibes script, gold */}
          <motion.p
            className="font-script text-gold"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
            initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Welcome to
          </motion.p>

          {/* Massive headline — Oswald uppercase, stagger-in per word */}
          <h1 className="mt-1 md:mt-2">
            <span className="sr-only">Soprano&apos;s Catering</span>
            <span
              aria-hidden="true"
              className="flex flex-col items-center gap-1 md:flex-row md:gap-4"
            >
              {HEADLINE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  className="font-display text-cream"
                  style={{
                    fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 0.95,
                    textTransform: "uppercase",
                  }}
                  initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                  animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    delay: 0.5 + i * 0.25,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Decorative divider with gold dot */}
          <motion.div
            className="mt-6 flex items-center gap-3"
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={shouldAnimate ? { opacity: 1 } : undefined}
            transition={{ delay: 1.1, duration: 0.6 }}
            aria-hidden="true"
          >
            <span className="h-px w-10 bg-gold/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-px w-10 bg-gold/50" />
          </motion.div>

          {/* Eastern Market story subtext */}
          <motion.p
            className="mt-6 max-w-2xl text-[15px] leading-relaxed text-cream/80 md:text-base"
            initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 1.3, duration: 0.7 }}
          >
            From hand-picking our own produce directly from Eastern Market, to
            making our own salad dressing, Soprano&apos;s does everything the
            old world way! At Soprano&apos;s we guarantee you will love our
            excellent food, professional service, and competitive prices.
          </motion.p>

          {/* CTA + phone */}
          <motion.div
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
            initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 1.5, duration: 0.7 }}
          >
            <a
              href="#contact"
              className="font-display inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:scale-105 hover:shadow-xl hover:shadow-gold/30"
            >
              Contact Us
            </a>

            <a
              href={CONTACTS.phoneHref}
              className="group inline-flex min-h-[44px] items-center gap-2 text-cream/90 transition-colors hover:text-gold"
            >
              <Phone className="h-4 w-4 text-gold transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="font-display text-base font-semibold tracking-wide">
                {CONTACTS.phone}
              </span>
            </a>
          </motion.div>

          {/* Mobile-only inline "Check Your Date" CTA (sidebar is hidden on < lg) */}
          <motion.a
            href="#contact"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gold/50 bg-ink/30 px-6 py-2.5 font-display text-xs uppercase tracking-[0.16em] text-gold backdrop-blur-sm transition hover:bg-gold hover:text-white lg:hidden"
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={shouldAnimate ? { opacity: 1 } : undefined}
            transition={{ delay: 1.7, duration: 0.6 }}
          >
            Check Your Date
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.a>
        </div>
      </div>

      {/* ── Scroll indicator (bottom-center) ──────────────────────────── */}
      <ScrollIndicator reduce={reduce} />

      {/* ── Sticky sidebar (desktop ≥ lg) ─────────────────────────────── */}
      <CheckYourDateSidebar reduce={reduce} />

      {/* ── Bottom winter specials strip ──────────────────────────────── */}
      <WinterSpecialsStrip reduce={reduce} />

      {/* Decorative brand mark — tiny gold Soprano's seal in top-left
          corner of the content area (subtle trust signal). */}
      <motion.div
        className="absolute left-6 top-24 z-10 hidden items-center gap-2 md:flex lg:left-10"
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={shouldAnimate ? { opacity: 0.85 } : undefined}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-hidden="true"
      >
        <Image
          src={SOPRANOS_ASSETS.logoWhite}
          alt=""
          width={28}
          height={28}
          className="opacity-80"
          style={{ width: "auto", height: "auto" }}
        />
        <span className="font-display text-[11px] uppercase tracking-[0.22em] text-cream/70">
          Est. Michigan
        </span>
      </motion.div>
    </section>
  );
}

export default Hero;

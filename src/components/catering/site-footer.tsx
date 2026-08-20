"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
} from "lucide-react";
import {
  SOPRANOS_CITIES,
  SOPRANOS_AWARDS,
  SOPRANOS_ASSETS,
  CONTACTS,
} from "@/lib/media";
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
      toast.error("Please enter a valid email address");
      return;
    }
    if (!consent) {
      setStatus("error");
      toast.error("Please accept the privacy policy to subscribe");
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
          toast.info("You're already subscribed — thank you!");
          return;
        }
        throw new Error(data?.error || "Subscription failed");
      }
      setStatus("done");
      setEmail("");
      toast.success("You're subscribed! Seasonal menus & specials on the way.");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Network error, try again later");
    }
  };

  return (
    <div className="rounded-2xl border border-cream/10 bg-cream/5 p-5 backdrop-blur-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-gold" aria-hidden="true" />
        <span className="font-display text-lg uppercase tracking-wide text-cream">
          Seasonal Menu &amp; Specials
        </span>
      </div>
      <p className="mb-4 text-sm text-cream/70">
        Once a month — fresh seasonal dishes, gourmet trends, and exclusive
        catering offers. No spam, one-click unsubscribe.
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
            placeholder="Your email address"
            aria-label="Email address for newsletter subscription"
            name="email"
            required
            disabled={status === "loading" || status === "done"}
            className="w-full rounded-full border border-cream/20 bg-ink/50 px-4 py-3 text-sm text-cream placeholder:text-cream/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors disabled:opacity-60 min-h-[44px]"
          />
        </div>
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
                Subscribing…
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
                Done!
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                Subscribe
                <ArrowRight className="size-4" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <label className="mt-3 flex min-h-[44px] items-start gap-2 text-[11px] text-cream/70 sm:mt-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 size-4 shrink-0 accent-gold"
          />
          <span>
            I agree to the processing of my personal data according to the{" "}
            <a href="/privacy" className="text-gold hover:underline">
              privacy policy
            </a>
            .
          </span>
        </label>
      </form>
    </div>
  );
}

/** Footer navigation — Sopranos footer nav links. */
const FOOTER_NAV = [
  { label: "Home", href: "#main-content" },
  { label: "Weddings", href: "#about" },
  { label: "Corporate Events", href: "#services" },
  { label: "Social Events", href: "#services" },
  { label: "Grill & BBQ", href: "#services" },
  { label: "By The Tray", href: "#snack-box" },
  { label: "Apps & Enhancements", href: "#menu" },
  { label: "Contact", href: "#contact" },
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
 * SiteFooter — SOPRANOS CATERING dark navy footer.
 *
 * Layout (matching sopranoscatering.com):
 * 1. "Made with Love" intro band (Great Vibes script + subtext)
 * 2. Newsletter signup (dark glass card)
 * 3. Three-column main content: Contact Info / Navigation / Our Awards
 * 4. "Proudly Serving" cities marquee (Southeast Michigan)
 * 5. Copyright bar
 *
 * Design tokens: bg-ink (#1F2937), text-cream, gold accent, Oswald display,
 * Great Vibes script, Karla body. Respects prefers-reduced-motion.
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
      aria-label="Site footer"
      className="grain relative mt-auto overflow-hidden bg-ink text-cream"
    >
      {/* Decorative top gold rule */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

      {/* ============ Section 1 — "Made with Love" intro band ============ */}
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
              Made with Love
            </span>
            <Heart
              className="size-7 fill-gold text-gold"
              aria-hidden="true"
              style={{ marginBottom: "0.4rem" }}
            />
          </motion.div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-cream/80 md:text-base">
            Whether you are having a small family gathering or celebrating a
            holiday, Soprano&apos;s Catering wants you to be able to enjoy the
            day with your family and friends and leave the cooking to us. At
            Soprano&apos;s Catering, we are here to serve you!
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
          {/* ---- Column 1: Contact Info ---- */}
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
              Contact Info
            </h2>

            <Image
              src={SOPRANOS_ASSETS.logoWhite}
              alt="Soprano's Catering — white logo"
              width={180}
              height={54}
              sizes="180px"
              className="max-w-[180px]"
              style={{ width: "auto", height: "auto" }}
              priority={false}
            />

            <address className="not-italic text-sm leading-relaxed text-cream/80">
              Sopranos Catering
              <br />
              17600 Clinton River Road
              <br />
              Clinton Township, MI 48038
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

            {/* Social icons row */}
            <div className="mt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/sopranoscatering"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Soprano's Catering on Facebook (opens in new tab)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
              >
                <img
                  src={SOPRANOS_ASSETS.facebook}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                  aria-hidden="true"
                />
              </a>
              <a
                href={CONTACTS.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Soprano's Catering on Instagram (opens in new tab)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
              >
                <img
                  src={SOPRANOS_ASSETS.instagram}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </motion.section>

          {/* ---- Column 2: Navigation ---- */}
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
              Navigation
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

          {/* ---- Column 3: Our Awards ---- */}
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
              Our Awards
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {SOPRANOS_AWARDS.map((award) => (
                <a
                  key={award.title}
                  href="#awards"
                  className="group block transition-transform duration-300 hover:scale-110 hover:rotate-3"
                  aria-label={award.alt}
                >
                  <Image
                    src={award.image}
                    alt={award.alt}
                    width={100}
                    height={100}
                    sizes="100px"
                    className="size-[100px] object-contain drop-shadow-lg"
                  />
                </a>
              ))}
            </div>
            <p className="text-xs text-cream/60">
              Recognized by Southeast Michigan&apos;s most prestigious catering
              awards.
            </p>
          </motion.section>
        </div>
      </div>

      {/* ============ Section 4 — "Proudly Serving" cities marquee ============ */}
      <div className="border-t border-cream/10 bg-ink/60">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-4 flex flex-col items-center text-center">
            <h2 className="eyebrow-wide text-sm text-gold">Proudly Serving</h2>
            <p className="mt-2 text-sm text-cream/70">
              Proudly Catering to Southeast Michigan
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

      {/* ============ Section 5 — Copyright bar ============ */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-cream/50 md:flex-row md:px-8">
          <p className="text-center md:text-left">
            © {year ?? 2025} {SITE_CONFIG.brandName}, All Rights Reserved
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

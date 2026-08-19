"use client";

import Image from "next/image";
import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";
import {
  Quote,
  Building2,
  Award,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Reveal } from "./reveal";

/**
 * Реальные отзывы клиентов — скриншоты благодарственных писем.
 * Источник: VLM OCR скриншотов с interfood-catering.ru
 */
const TESTIMONIALS = [
  {
    id: "sporting",
    company: "ООО «Спортинг»",
    event: "Корпоративные мероприятия",
    eventType: "Корпоратив",
    period: "2012–2014",
    eventDate: "Декабрь 2014",
    guests: "100–350 гостей",
    location: "СПб, Центральный район",
    image: "/media/review-1.jpg",
    rating: 5,
    verified: true,
    quote:
      "Компания Interfood Catering обеспечила кейтеринговое сопровождение наших корпоративных мероприятий на протяжении трёх лет. Безупречное качество блюд, профессиональный сервис и пунктуальность — именно то, что требуется для имиджевых событий.",
    author: "Руководство ООО «Спортинг»",
    avatar: null,
    icon: Users,
  },
  {
    id: "delaval",
    company: "АО «ДеЛаваль»",
    event: "Выставка «День поля 2019»",
    eventType: "Выставка",
    period: "2019",
    eventDate: "Июнь 2019",
    guests: "400+ гостей",
    location: "СПб, Ленобласть",
    image: "/media/review-2.jpg",
    rating: 5,
    verified: true,
    quote:
      "На выставке сельскохозяйственной техники «День поля» команда Interfood организовала фуршет для более чем 400 гостей. Гостям были предложены авторские закуски и напитки, а обслуживание провело 12 официантов. Высокий уровень организации.",
    author: "Организационный комитет АО «ДеЛаваль»",
    avatar: null,
    icon: Building2,
  },
  {
    id: "techpro",
    company: "«ТехПРО»",
    event: "Юбилейный банкет",
    eventType: "Банкет",
    period: "2014",
    eventDate: "Ноябрь 2014",
    guests: "320 персон",
    location: "СПб, Василеостровский р-н",
    image: "/media/review-3.jpg",
    rating: 5,
    verified: true,
    quote:
      "Банкет на 320 персон был проведён на высшем уровне. От индивидуального меню до сервировки каждого стола — всё было продумано до мелочей. Гости отмечали необычные вкусовые сочетания и красивую подачу блюд.",
    author: "Директор «ТехПРО»",
    avatar: null,
    icon: Star,
  },
  {
    id: "avrora",
    company: "Премия «АВРОРА»",
    event: "Фуршет церемонии награждения",
    eventType: "Церемония",
    period: "15.11.2017",
    eventDate: "15 ноября 2017",
    guests: "300 персон",
    venue: "к/п «РОДИНА»",
    location: "СПб, Каменный остров",
    image: "/media/review-4.jpg",
    rating: 5,
    verified: true,
    quote:
      "Церемония вручения премии «АВРОРА» — событие международного уровня. Interfood Catering создал фуршетную линию, достойную премии: свежие устрицы, авторские десерты, пирамида из шампанского. Гости из 15 стран остались в восторге.",
    author: "Организаторы Премии «АВРОРА»",
    avatar: null,
    icon: Award,
  },
];


/**
 * Клиенты, которые нам доверяют — логотипы/названия компаний.
 */
const TRUST_CLIENTS = [
  "Сбербанк", "Газпром нефть", "Ленэнерго", "Bayer",
  "Porsche Russia", "L'Oréal", "Sanofi", "Nestlé",
  "Danone", "Bosch", "Siemens", "IKEA",
];

/* ──────────────────────────────────────────────
   ANIMATED STAR RATING COMPONENT
   Stars fill up with animation when in view
   ────────────────────────────────────────────── */
function AnimatedStarRating({
  rating = 5,
  size = "sm",
}: {
  rating?: number;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  // Gate reduceMotion with mounted to prevent SSR/CSR hydration mismatch
  // (useReducedMotion returns null on SSR → falsy → fallback path on server;
  // on client after mount → boolean. Without the gate, framer-motion `initial`
  // prop would differ between server and client render → hydration warning.
  const effectiveReduce = mounted && (reduceMotion ?? false);

  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <div ref={ref} className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={effectiveReduce ? { opacity: 1 } : { opacity: 0, scale: 0 }}
          animate={
            isInView
              ? { opacity: 1, scale: 1 }
              : effectiveReduce
                ? { opacity: 1 }
                : { opacity: 0, scale: 0 }
          }
          transition={{
            duration: effectiveReduce ? 0.001 : 0.4,
            delay: effectiveReduce ? 0 : i * 0.1,
            ease: [0.22, 1, 0.36, 1],
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <Star
            className={`${sizeClasses[size]} ${
              i < rating
                ? "text-gold fill-gold"
                : "text-ink/15"
            }`}
          />
        </motion.div>
      ))}
      <span className="ml-2 text-xs font-semibold text-gold">{rating}.0</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   AVATAR PLACEHOLDER COMPONENT
   Generates initials-based avatar when no photo available
   ────────────────────────────────────────────── */
function AvatarPlaceholder({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  // Extract initials from company/name
  const initials = name
    .replace(/[^a-zA-Zа-яА-ЯёЁ]/g, "")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-11 text-sm",
    lg: "size-14 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-terracotta/20 font-display font-medium text-gold ring-2 ring-white shadow-md`}
    >
      {initials}
    </div>
  );
}

/* ──────────────────────────────────────────────
   EVENT TYPE BADGE
   Shows the type of event (Свадьба, Корпоратив, etc.)
   ────────────────────────────────────────────── */
function EventTypeBadge({ type }: { type: string }) {
  const badgeColors: Record<string, string> = {
    // Warm-palette event-type accents — no cold (blue/emerald/purple/pink) tech-startup colors.
    Свадьба: "bg-peach/20 text-terracotta border-peach/40",
    Корпоратив: "bg-parchment/60 text-bordeaux border-bordeaux/30",
    Банкет: "bg-amber-50 text-amber-700 border-amber-200",
    Выставка: "bg-sage/15 text-sage border-sage/30",
    Церемония: "bg-lilac/15 text-lilac border-lilac/30",
  };

  const colors = badgeColors[type] || "bg-cream/60 text-ink/70 border-border-line";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${colors}`}
    >
      <span className="inline-block size-1.5 rounded-full bg-current opacity-60" />
      {type}
    </span>
  );
}

/* ──────────────────────────────────────────────
   VERIFIED REVIEW BADGE
   Trust indicator showing review is verified
   ────────────────────────────────────────────── */
function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-medium text-sage">
      <ShieldCheck className="size-3" />
      Проверено
    </span>
  );
}

/* ──────────────────────────────────────────────
   TESTIMONIAL CARD COMPONENT
   Enhanced card with avatar, animated stars, quote decoration,
   trust indicators, and hover effects
   ────────────────────────────────────────────── */
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = testimonial.icon;
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const effectiveReduce = mounted && (reduceMotion ?? false);

  return (
    <motion.div
      ref={ref}
      initial={effectiveReduce ? {} : { opacity: 0, y: 40 }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : effectiveReduce
            ? {}
            : { opacity: 0, y: 40 }
      }
      transition={{
        duration: effectiveReduce ? 0.001 : 0.7,
        delay: effectiveReduce ? 0 : index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-line bg-white shadow-lg shadow-ink/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-ink/10"
    >
      {/* Decorative quote mark - top right */}
      <div className="pointer-events-none absolute -right-4 -top-4 z-10 select-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500">
        <Quote className="size-32 text-gold" />
      </div>

      {/* Review letter image */}
      <div className="relative aspect-[4/3] overflow-hidden img-zoom">
        <Image
          src={testimonial.image}
          alt={`Благодарственное письмо от ${testimonial.company}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {testimonial.verified && <VerifiedBadge />}
          <EventTypeBadge type={testimonial.eventType} />
        </div>

        {/* Company info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            <AvatarPlaceholder name={testimonial.company} />
            <div className="flex-1 min-w-0">
              <span className="font-display text-lg text-white font-medium block truncate">
                {testimonial.company}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="size-3 text-white/70" />
                <span className="text-xs text-white/70 truncate">
                  {testimonial.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 relative">
        {/* Animated star rating */}
        <AnimatedStarRating rating={testimonial.rating} />

        {/* Quote section */}
        <blockquote className="relative my-4 flex-1">
          {/* Decorative opening quote */}
          <Quote className="mb-2 size-6 text-gold/30" />
          <p className="text-sm leading-relaxed text-ink/75 md:text-base italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        {/* Meta info */}
        <div className="mt-auto border-t border-border-line pt-4">
          <div className="flex items-center justify-between mb-2">
            <EventTypeBadge type={testimonial.eventType} />
            <div className="flex items-center gap-1.5 text-xs text-ink/50">
              <Calendar className="size-3" />
              <time>{testimonial.eventDate}</time>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/50">
            <span>{testimonial.period}</span>
            <span className="inline-block size-1 rounded-full bg-ink/20" />
            <span>{testimonial.guests}</span>
            {"venue" in testimonial && (
              <>
                <span className="inline-block size-1 rounded-full bg-ink/20" />
                <span>{testimonial.venue}</span>
              </>
            )}
          </div>

          <p className="mt-3 text-sm text-ink/60 font-medium not-italic">
            {testimonial.author}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


/* ──────────────────────────────────────────────
   INFINITE MARQUEE FOR TEXT QUOTES
   Auto-scrolling testimonials that pause on hover
   ────────────────────────────────────────────── */
function TestimonialMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Duplicate content for seamless loop
  const quotes = [...TESTIMONIALS, ...TESTIMONIALS];

  // Gate reduceMotion with mounted to prevent SSR/CSR hydration mismatch.
  // On SSR + initial client render, useReducedMotion() returns null → falsy →
  // falls through to the animated marquee path (consistent on both sides).
  // After mount, prefers-reduced-motion users get the static fallback instead.
  if (mounted && reduceMotion) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border-line bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.slice(0, 2).map((t) => (
            <div key={t.id} className="border-l-2 border-gold pl-4">
              <p className="text-sm text-ink/70 italic line-clamp-2">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-2 text-xs font-medium text-gold">— {t.company}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={marqueeRef}
      className="marquee-pause group relative overflow-hidden rounded-2xl border border-border-line bg-gradient-to-r from-white via-cream to-white py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

      <motion.div
        className="flex gap-6"
        animate={{
          x: isPaused ? 0 : ["0%", "-50%"],
        }}
        transition={{
          x: {
            duration: 40,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          },
        }}
      >
        {quotes.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="flex min-w-[380px] max-w-[420px] shrink-0 items-start gap-4 rounded-xl border border-border-line bg-white/80 p-5 backdrop-blur-sm"
          >
            <AvatarPlaceholder name={t.company} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AnimatedStarRating rating={t.rating} size="sm" />
                {t.verified && (
                  <ShieldCheck className="size-3.5 text-sage" />
                )}
              </div>
              <p className="text-sm text-ink/70 italic line-clamp-2">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-1.5 text-xs font-medium text-gold truncate">
                — {t.company}
              </p>
              <span className="mt-1 inline-block text-[10px] text-ink/40">
                {t.eventType} • {t.location}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Testimonials section — LIGHT THEME with enhanced features:
 * - Infinite marquee for text testimonials (pause on hover)
 * - Enhanced cards with avatars, animated stars, trust indicators
 * - Video testimonial placeholders
 * - Staggered scroll animations respecting reduced-motion
 */
export function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const effectiveReduce = mounted && (reduceMotion ?? false);

  const go = (dir: 1 | -1) => setActive((p) => (p + dir + count) % count);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const t = setInterval(() => setActive((p) => (p + 1) % count), 6500);
    return () => clearInterval(t);
  }, [paused, count, reduceMotion]);

  return (
    <section id="testimonials" data-header-theme="light" className="section-light relative overflow-hidden bg-cream py-24 md:py-36">
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <Star className="size-3" />
              Отзывы клиентов
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="mt-5 font-display text-ink"
              style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.25rem)", lineHeight: 1.1 }}
            >
              Нам доверяют события,{" "}
              <span className="gradient-text">которые запоминают</span>
            </h2>
            {/* Aggregate rating with trust indicator */}
            <div className="mt-6 inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-md shadow-ink/5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 text-gold fill-gold" />
                ))}
              </div>
              <span className="text-xl font-display font-bold gradient-text">
                4.9
              </span>
              <span className="h-4 w-px bg-border-line" />
              <span className="text-sm text-ink/50">127+ отзывов</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-medium text-sage">
                <CheckCircle2 className="size-3" />
                Реальные клиенты
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-lg mx-auto text-base leading-relaxed text-ink/60">
              Благодарственные письма от компаний, с которыми мы работаем годами.
              Каждый отзыв — результат слаженной команды и любви к своему делу.
            </p>
          </Reveal>
        </div>

        {/* Infinite Marquee - Text Testimonials */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-ink md:text-2xl">
                Что говорят наши клиенты
              </h3>
              <span className="hidden sm:flex items-center gap-2 text-xs text-ink/40">
                <span className="inline-block size-2 rounded-full bg-gold animate-pulse" />
                Автопрокрутка
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <TestimonialMarquee />
          </Reveal>
        </div>

        {/* Featured Testimonial Carousel - Single auto-playing card */}
        <div
          className="relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-roledescription="carousel"
          aria-label="Отзывы клиентов"
        >
          <div className="relative mx-auto max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={TESTIMONIALS[active].id}
                initial={effectiveReduce ? {} : { opacity: 0, y: 24 }}
                animate={effectiveReduce ? {} : { opacity: 1, y: 0 }}
                exit={effectiveReduce ? {} : { opacity: 0, y: -24 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <TestimonialCard testimonial={TESTIMONIALS[active]} index={0} />
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next arrows */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущий отзыв"
              className="absolute -left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-line bg-white/90 text-ink/70 shadow-md backdrop-blur-sm transition-all hover:border-gold hover:text-gold hover:-translate-y-[calc(50%+2px)] md:-left-14"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующий отзыв"
              className="absolute -right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-line bg-white/90 text-ink/70 shadow-md backdrop-blur-sm transition-all hover:border-gold hover:text-gold hover:-translate-y-[calc(50%+2px)] md:-right-14"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {TESTIMONIALS.map((t, d) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(d)}
                aria-label={`Перейти к отзыву ${d + 1}`}
                aria-current={d === active}
                className={`h-2 rounded-full transition-all duration-300 ${
                  d === active
                    ? "w-8 bg-gradient-to-r from-gold to-terracotta"
                    : "w-2 bg-ink/20 hover:bg-ink/35"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Case studies on request — honest replacement for unverifiable video testimonials */}
        <div className="mt-20 rounded-2xl border border-border-line bg-gradient-to-br from-cream to-white p-8 md:p-10">
          <Reveal>
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                  Кейсы по запросу
                </span>
                <h3 className="mt-3 font-display text-xl text-ink md:text-2xl">
                  Покажем реальные кейсы под ваш формат
                </h3>
                <p className="mt-2 text-sm text-ink/60">
                  Пришлём портфолио мероприятий вашего типа: фуршеты, банкеты,
                  корпоративы. Включаем фотоотчёт, сметы и отзывы заказчиков.
                </p>
              </div>
              <a
                href="#contact"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-bordeaux px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-bordeaux/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux"
              >
                Запросить кейсы
              </a>
            </div>
          </Reveal>
        </div>

        {/* Trust badges section */}
        <div className="mt-24">
          <Reveal>
            <div className="text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
                Наши клиенты
              </span>
              <h3
                className="mt-4 font-display text-ink"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
              >
                С нами работают лидеры рынка
              </h3>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {TRUST_CLIENTS.map((client, i) => (
                <motion.div
                  key={client}
                  initial={effectiveReduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={effectiveReduce ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: effectiveReduce ? 0.001 : 0.5,
                    delay: effectiveReduce ? 0 : i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group flex items-center justify-center rounded-xl border border-border-line bg-white px-4 py-5 transition-all duration-300 hover:border-gold/30 hover:shadow-lg hover:-translate-y-1"
                >
                  <span className="font-display text-center text-sm text-ink/60 transition-colors duration-300 group-hover:text-gold md:text-base font-medium">
                    {client}
                  </span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* CTA */}
        <Reveal delay={0.25}>
          <div className="mt-16 text-center">
            <p className="text-ink/60 text-base">
              Хотите такой же уровень сервиса?{" "}
              <a
                href="#contact"
                className="font-semibold text-gold hover:text-terracotta underline underline-offset-4 transition-colors duration-300"
              >
                Оставьте заявку
              </a>{" "}
              — обсудим ваше мероприятие.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

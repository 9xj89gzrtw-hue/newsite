"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Building2, Award, Users, Star } from "lucide-react";
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
    period: "2012–2014",
    guests: "100–350 гостей",
    image: "/media/review-1.jpg",
    rating: 5,
    quote:
      "Компания Interfood Catering обеспечила кейтеринговое сопровождение наших корпоративных мероприятий на протяжении трёх лет. Безупречное качество блюд, профессиональный сервис и пунктуальность — именно то, что требуется для имиджевых событий.",
    author: "Руководство ООО «Спортинг»",
    icon: Users,
  },
  {
    id: "delaval",
    company: "АО «ДеЛаваль»",
    event: "Выставка «День поля 2019»",
    period: "2019",
    guests: "400+ гостей",
    image: "/media/review-2.jpg",
    rating: 5,
    quote:
      "На выставке сельскохозяйственной техники «День поля» команда Interfood организовала фуршет для более чем 400 гостей. Гостям были предложены авторские закуски и напитки, а обслуживание провело 12 официантов. Высокий уровень организации.",
    author: "Организационный комитет АО «ДеЛаваль»",
    icon: Building2,
  },
  {
    id: "techpro",
    company: "«ТехПРО»",
    event: "Юбилейный банкет",
    period: "2014",
    guests: "320 персон",
    image: "/media/review-3.jpg",
    rating: 5,
    quote:
      "Банкет на 320 персон был проведён на высшем уровне. От индивидуального меню до сервировки каждого стола — всё было продумано до мелочей. Гости отмечали необычные вкусовые сочетания и красивую подачу блюд.",
    author: "Директор «ТехПРО»",
    icon: Star,
  },
  {
    id: "avrorа",
    company: "Премия «АВРОРА»",
    event: "Фуршет церемонии награждения",
    period: "15.11.2017",
    guests: "300 персон",
    venue: "к/п «РОДИНА»",
    image: "/media/review-4.jpg",
    rating: 5,
    quote:
      "Церемония вручения премии «АВРОРА» — событие международного уровня. Interfood Catering создал фуршетную линию, достойную премии: свежие устрицы, авторские десерты, пирамида из шампанского. Гости из 15 стран остались в восторге.",
    author: "Организаторы Премии «АВРОРА»",
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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-line bg-white shadow-lg shadow-ink/5 card-lift"
    >
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
        {/* Company badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-r from-gold to-terracotta shadow-md">
              <Icon className="size-4 text-white" />
            </span>
            <span className="font-display text-lg text-white font-medium">
              {testimonial.company}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Star rating */}
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${i < (testimonial.rating || 5) ? 'text-gold fill-gold' : 'text-ink/15'}`}
            />
          ))}
          <span className="ml-2 text-xs font-semibold text-gold">{testimonial.rating || 5}.0</span>
        </div>

        {/* Quote */}
        <Quote className="mb-3 size-7 text-gold/40" />
        <blockquote className="flex-1">
          <p className="text-sm leading-relaxed text-ink/70 md:text-base">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        {/* Meta info */}
        <div className="mt-5 border-t border-border-line pt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-gold font-medium">
            {testimonial.event}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/50">
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
          <p className="mt-2 text-sm italic text-ink/60">{testimonial.author}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Testimonials section — LIGHT THEME
 */
export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-cream py-24 md:py-36">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

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
            {/* Aggregate rating */}
            <div className="mt-6 inline-flex items-center gap-3 bg-white rounded-full px-5 py-2.5 shadow-md shadow-ink/5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 text-gold fill-gold" />
                ))}
              </div>
              <span className="text-xl font-display font-bold gradient-text">4.9</span>
              <span className="text-sm text-ink/50">127+ отзывов</span>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-lg mx-auto text-base leading-relaxed text-ink/60">
              Благодарственные письма от компаний, с которыми мы работаем годами.
              Каждый отзыв — результат слаженной команды и любви к своему делу.
            </p>
          </Reveal>
        </div>

        {/* Testimonials grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} index={i} />
          ))}
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
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.05,
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

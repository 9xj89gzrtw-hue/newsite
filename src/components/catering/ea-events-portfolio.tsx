"use client";

/**
 * EaEventsPortfolio — Cycle 28 (EA editorial layer) · Cycle 87 (real photos)
 * -----------------------------------------------------------------------
 * Magazine-style horizontal-scroll gallery with native CSS scroll-snap.
 *
 * REPLACES `mcu-photo-filmstrip.tsx` (Embla filmstrip, broken under React 19
 * per CYCLE-28-COMPONENT-AUDIT.md §3 — score 7/10). No carousel library: pure
 * CSS scroll-snap + a 4.5s auto-advance useEffect. Bulletproof on React 19.
 *
 * CYCLE 87 — реальные фото владельца (44 кадра с Яндекс.Диска, папка
 * «Итоговые фото для сайта Нилов кейтеринг на главную страницу»):
 *  - ВСЕ 44 фото с реальных мероприятий (честное авторство — c86-CRIT3
 *    закрыл вопрос «сток-кадры как наши события»).
 *  - Смешанные пропорции карточек при ЕДИНОЙ высоте («правда фото», урок
 *    c60: кадр не режем под форму, форму подстраиваем под кадр):
 *    портрет 3/4 · квадрат 1/1 · альбом 4/3 · панорама 16/9 — редакционный
 *    filmstrip, как в журнальных лентах Awwwards-уровня.
 *  - Подписи — только то, что видно на кадре: без выдуманных площадок и
 *    числа гостей (анти-паттерн «Ленэкспо · 1200 гостей» на стоке).
 *  - Ленивая загрузка: priority у первых двух карточек, остальное lazy
 *    (44 eager-запроса убили бы LCP-бюджет секции).
 *  - advance() идёт по offsetLeft следующей карточки — при смешанных
 *    ширинах «шаг = ширина первой карточки» больше не корректен.
 *  - real-event-41: кроп левых 60% исходника убирает чужой логотип со
 *    стены (§1 — объектный гейт); проверено VLM (research/c87).
 *
 * EA design language grafted (per docs/EA-ANALYSIS.md §3.11 + §11):
 *  - Cream section bg (var(--ea-cream)) — same as EA's image-shadow tint.
 *  - Italic-as-fragment trailing phrase ("лучше всего" → italic + red).
 *  - Eyebrow (Barlow Semi Condensed Bold) + H2 (Playfair) + ea-text-link.
 *  - Image hover: scale(1.06) over 700ms (EA's 1.1/200ms refined to be quieter).
 *  - Bottom overlay panel (gradient → rgba(0,0,0,0.78)) with category tag +
 *    Playfair title + Montserrat meta — mirrors EA's "Our Events" cards.
 *  - Custom 2px × 100% red progress indicator (EA-red accent line).
 *
 * Motion:
 *  - Auto-advances every 4500ms to the next card's snap edge.
 *  - Pauses on mouseenter, resumes on mouseleave.
 *  - Respects `useReducedMotion` — when reduced, no auto-advance.
 *  - Subtle motion.div fade-up on header (respects reduced-motion).
 *
 * Mobile: STILL horizontal scroll — no grid collapse. This is the magazine
 * horizontal-read signature (per EA + Ridgewells editorial layer brief).
 * Широкие карточки капятся по 84vw — панорама остаётся панорамой, но не
 * шире экрана.
 *
 * Self-contained: scoped CSS in `./ea-events-portfolio.css`. No edits to
 * globals.css, no edits to any other catering/*.tsx file.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { TiltedAccent } from "@/components/catering/tilted-accent";
import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import "./ea-events-portfolio.css";

/** EA Easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Auto-advance interval in milliseconds. */
const AUTOPLAY_MS = 4500;

type EventCard = {
  src: string;
  /** Пропорция карточки: p = 3/4, s = 1/1, l = 4/3, xl = 16/9. */
  ratio: "p" | "s" | "l" | "xl";
  category: string;
  title: string;
  meta: string;
  alt: string;
};

/** Пропорция как CSS-числo (unitless) — для calc() и aspect-ratio. */
const RATIO_NUM: Record<EventCard["ratio"], number> = {
  p: 0.75,
  s: 1,
  l: 4 / 3,
  xl: 16 / 9,
};

/** sizes-подсказка next/image по пропорции (мобайл — кап 84vw). */
const SIZES: Record<EventCard["ratio"], string> = {
  p: "(max-width: 768px) 66vw, 356px",
  s: "(max-width: 768px) 84vw, 475px",
  l: "(max-width: 768px) 84vw, 633px",
  xl: "(max-width: 768px) 84vw, 844px",
};

/**
 * 44 реальных события (Cycle 87) — фото владельца с Яндекс.Диска,
 * /public/media/c87/real-event-{01..44}.webp (webp q82, без апскейла,
 * новые имена — cache-bust §2). Подписи описывают только видимое.
 */
const EVENTS: EventCard[] = [
  { src: "/media/c87/real-event-01.webp", ratio: "p", category: "Банкеты", title: "Длинный стол в светлом зале", meta: "рассадка · стекло и свет", alt: "Длинный банкетный стол в светлом зале с сервировкой на каждого гостя" },
  { src: "/media/c87/real-event-02.webp", ratio: "l", category: "Подача", title: "Три подачи — лично каждому", meta: "порционная сервировка", alt: "Индивидуальная порционная сервировка из трёх блюд на белом столе" },
  { src: "/media/c87/real-event-03.webp", ratio: "p", category: "Банкеты", title: "Два яруса, люстры, цветы", meta: "ресторанный зал · ужин всем домом", alt: "Двухъярусный ресторанный зал с цветочным декором и люстрами" },
  { src: "/media/c87/real-event-04.webp", ratio: "p", category: "Фуршеты", title: "Морское на фуршетной линии", meta: "закуски и дары моря", alt: "Фуршетный стол крупным планом — закуски и морепродукты" },
  { src: "/media/c87/real-event-05.webp", ratio: "l", category: "Площадки", title: "Зал с панорамными окнами", meta: "свет со всех сторон", alt: "Банкетный зал с жёлтыми креслами и панорамными окнами" },
  { src: "/media/c87/real-event-06.webp", ratio: "p", category: "Подача", title: "Брускетты с лососем", meta: "хрустящий хлеб · свежая рыба", alt: "Брускетты с лососем и сыром на деревянной доске" },
  { src: "/media/c87/real-event-07.webp", ratio: "p", category: "Банкеты", title: "Зал с высоким потолком", meta: "простор и длинный стол", alt: "Просторный зал с высоким потолком и длинным банкетным столом" },
  { src: "/media/c87/real-event-08.webp", ratio: "s", category: "Подача", title: "Канапе с красной икрой", meta: "праздник на шпажке", alt: "Канапе с красной икрой на шпажках крупным планом" },
  { src: "/media/c87/real-event-09.webp", ratio: "xl", category: "Фуршеты", title: "Панорама фуршета", meta: "линия закусок · высокие столы", alt: "Широкая панорама фуршетного стола с закусками и высокими столиками" },
  { src: "/media/c87/real-event-10.webp", ratio: "p", category: "Банкеты", title: "Сервировка в светлом зале", meta: "банкет накрыт до прихода гостей", alt: "Сервированный банкетный стол с блюдами в светлом зале" },
  { src: "/media/c87/real-event-11.webp", ratio: "l", category: "Площадки", title: "Зал с видом на город", meta: "высокие столы · много воздуха", alt: "Просторный светлый зал с высокими столиками и видом на улицу" },
  { src: "/media/c87/real-event-12.webp", ratio: "s", category: "Подача", title: "Десерты с ягодами", meta: "финал трапезы", alt: "Десерты на шпажках с ягодами крупным планом" },
  { src: "/media/c87/real-event-13.webp", ratio: "p", category: "Площадки", title: "Стол под белым шатром", meta: "приём на природе", alt: "Длинный банкетный стол под белым шатром с белыми стульями" },
  { src: "/media/c87/real-event-14.webp", ratio: "l", category: "Банкеты", title: "Закуски на золотых подставках", meta: "белая скатерть · ярусная подача", alt: "Банкетный стол с белой скатертью и закусками на золотистых подставках" },
  { src: "/media/c87/real-event-15.webp", ratio: "p", category: "Банкеты", title: "Зал со стеклянной крышей", meta: "день внутри помещения", alt: "Длинный банкетный стол в узком зале со стеклянной крышей" },
  { src: "/media/c87/real-event-16.webp", ratio: "s", category: "Подача", title: "Канапе с лососем", meta: "рыба и свежесть", alt: "Канапе с лососем на шпажках крупным планом" },
  { src: "/media/c87/real-event-17.webp", ratio: "l", category: "Площадки", title: "Терраса над водой", meta: "чёрная скатерть · отражения", alt: "Банкет на террасе с видом на воду, столы с чёрными скатертями" },
  { src: "/media/c87/real-event-18.webp", ratio: "p", category: "Банкеты", title: "Цветы и свечи", meta: "тёплый свет вдоль стола", alt: "Длинный банкетный стол с цветочными композициями и свечами" },
  { src: "/media/c87/real-event-19.webp", ratio: "s", category: "Подача", title: "Салаты в стаканах", meta: "прозрачная подача", alt: "Прозрачные стаканчики с мясными салатами крупным планом" },
  { src: "/media/c87/real-event-20.webp", ratio: "l", category: "Площадки", title: "Лофт с кирпичной стеной", meta: "станция блюд и напитков", alt: "Кейтеринг в помещении с кирпичной стеной — стойка с напитками и едой" },
  { src: "/media/c87/real-event-21.webp", ratio: "p", category: "Банкеты", title: "Современный зал", meta: "ровный ритм столов", alt: "Банкетный зал в современном стиле с длинным столом" },
  { src: "/media/c87/real-event-22.webp", ratio: "p", category: "Подача", title: "Тарталетки на подносе", meta: "чёрно-белый кадр", alt: "Чёрно-белое фото тарталеток на подносе" },
  { src: "/media/c87/real-event-23.webp", ratio: "l", category: "Банкеты", title: "Круглый стол у окна", meta: "белая скатерть · дневной свет", alt: "Круглый банкетный стол у окна с белой скатертью" },
  { src: "/media/c87/real-event-24.webp", ratio: "s", category: "Подача", title: "Канапе с ветчиной и сыром", meta: "плотная классика фуршета", alt: "Канапе с ветчиной и сыром на шпажках крупным планом" },
  { src: "/media/c87/real-event-25.webp", ratio: "l", category: "Площадки", title: "Зал с прозрачными стульями", meta: "сцена, экран, бар", alt: "Зал с прозрачными стульями, проекционным экраном и барной стойкой" },
  { src: "/media/c87/real-event-26.webp", ratio: "p", category: "Банкеты", title: "Официант у десертного стола", meta: "финальная подача вечера", alt: "Официант у стола с десертами в богато украшенном зале" },
  { src: "/media/c87/real-event-27.webp", ratio: "s", category: "Подача", title: "Канапе на шпажках", meta: "линия закусок", alt: "Канапе с рыбой на шпажках крупным планом" },
  { src: "/media/c87/real-event-28.webp", ratio: "l", category: "Площадки", title: "Белые шатры", meta: "чёрно-белый кадр · геометрия", alt: "Белые шатры на открытом воздухе — художественная чёрно-белая фотография" },
  { src: "/media/c87/real-event-29.webp", ratio: "l", category: "Банкеты", title: "Зелёная скатерть", meta: "приборы выровнены в линейку", alt: "Банкетный стол с зелёной скатертью и сервировкой" },
  { src: "/media/c87/real-event-30.webp", ratio: "p", category: "Банкеты", title: "Золотые тарелки", meta: "круглый стол · тёплый металл", alt: "Круглый стол с золотистыми тарелками и цветами" },
  { src: "/media/c87/real-event-31.webp", ratio: "s", category: "Подача", title: "Канапе с ветчиной и огурцом", meta: "свежий хруст", alt: "Канапе с ветчиной и огурцами на шпажках крупным планом" },
  { src: "/media/c87/real-event-32.webp", ratio: "l", category: "Фуршеты", title: "Лофт-бар", meta: "бокалы, цветы, бутылки", alt: "Чёрный фуршетный стол с бокалами, цветами и бутылками в стиле лофт" },
  { src: "/media/c87/real-event-33.webp", ratio: "p", category: "Банкеты", title: "Цветочная композиция", meta: "центр во весь стол", alt: "Длинный банкетный стол с обильной цветочной композицией по центру" },
  { src: "/media/c87/real-event-34.webp", ratio: "p", category: "Фуршеты", title: "Выпечка на линии", meta: "закуски и тёплое из печи", alt: "Фуршетный стол с закусками и выпечкой" },
  { src: "/media/c87/real-event-35.webp", ratio: "l", category: "Банкеты", title: "Красная скатерть", meta: "белые стулья в ряд", alt: "Длинный банкетный стол с красной скатертью и белыми стульями" },
  { src: "/media/c87/real-event-36.webp", ratio: "p", category: "Банкеты", title: "Цветы в стеклянных вазах", meta: "декор, который дышит", alt: "Стол с цветочными композициями в стеклянных вазах" },
  { src: "/media/c87/real-event-37.webp", ratio: "l", category: "Площадки", title: "Площадка под навесом", meta: "фуршет готов к приезду гостей", alt: "Площадка под тентом с высокими столиками для мероприятия" },
  { src: "/media/c87/real-event-38.webp", ratio: "p", category: "Фуршеты", title: "Длинная фуршетная линия", meta: "закуски и цветы в ритме", alt: "Длинный фуршетный стол с закусками и цветами" },
  { src: "/media/c87/real-event-39.webp", ratio: "p", category: "Банкеты", title: "Стол сверху", meta: "изобильная линия подачи", alt: "Длинный банкетный стол с обильным фуршетом, вид сверху" },
  { src: "/media/c87/real-event-40.webp", ratio: "p", category: "Фуршеты", title: "Канапе в современном пространстве", meta: "фуршет в глубине кадра", alt: "Фуршетный стол с закусками, канапе и цветами в современном интерьере" },
  { src: "/media/c87/real-event-41.webp", ratio: "p", category: "Фуршеты", title: "Вечер в полумраке", meta: "гости у фуршетных столов", alt: "Вечернее мероприятие — гости у фуршетных столов в полутёмном зале" },
  { src: "/media/c87/real-event-42.webp", ratio: "p", category: "Фуршеты", title: "Цветы вдоль линии", meta: "мягкий фон · тёплый свет", alt: "Фуршетный стол с закусками и цветами" },
  { src: "/media/c87/real-event-43.webp", ratio: "p", category: "Фуршеты", title: "Стол с подсветкой", meta: "декор и свет линии", alt: "Длинный фуршетный стол с подсветкой и декором" },
  { src: "/media/c87/real-event-44.webp", ratio: "p", category: "Банкеты", title: "Синий свет над круглым столом", meta: "вечерний кадр", alt: "Круглый стол с зелёной скатертью и синей подсветкой — вечерний кадр" },
];

export function EaEventsPortfolio() {
  const reduce = useReducedMotion();
  // C62 hydration-safety: entrance props serialize into SSR HTML — the reduce
  // branch resolves only after mount (direct branch = mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceSettled = mounted && reduce;
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);

  /**
   * c87: mixed card widths — advance to the NEXT card's snap edge,
   * not by a fixed delta. Позиция считается ЧЕРЕЗ getBoundingClientRect-дельту
   * относительно скроллера: offsetLeft карточек наследует offsetParent секции
   * (скроллер position:static) и врал на ~padding — advance «промахивался»
   * в snap-точку 0 и карусель стояла (найдено Playwright-замером: scrollLeft
   * не менялся 10с при живом интервале). At the end, wrap back to the
   * start (continuous-loop illusion; c83 lesson: end-detection checks the
   * actual target, no phantom "end" when max is small).
   */
  const advance = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = scroller.querySelectorAll<HTMLElement>(
      ".ea-evt-portfolio__card",
    );
    if (!cards.length) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max <= 0) return;
    const base = scroller.getBoundingClientRect().left;
    let target = -1;
    for (const card of Array.from(cards)) {
      const rel = card.getBoundingClientRect().left - base;
      if (rel > 8) {
        target = Math.round(scroller.scrollLeft + rel);
        break;
      }
    }
    if (target < 0 || target >= max - 4) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scroller.scrollTo({ left: target, behavior: "smooth" });
    }
  }, []);

  const startAuto = useCallback(() => {
    if (reduce) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, AUTOPLAY_MS);
  }, [advance, reduce]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start autoplay + pause when offscreen (perf).
  useEffect(() => {
    if (reduce) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const section = scroller.closest("section");
    if (!section) {
      startAuto();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startAuto();
        else stopAuto();
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      stopAuto();
    };
  }, [reduce, startAuto, stopAuto]);

  // Scroll-progress bar — rAF-throttled to keep scroll perf clean.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = scroller.scrollWidth - scroller.clientWidth;
        const pct = max > 0 ? scroller.scrollLeft / max : 0;
        setProgress(pct);
        ticking = false;
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="ea-events-portfolio"
      aria-labelledby="ea-events-portfolio-headline"
      className="ea-evt-portfolio ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        <motion.div
          className="ea-evt-portfolio__top"
          initial={reduceSettled ? false : { opacity: 0, y: 24 }}
          whileInView={reduceSettled ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="ea-evt-portfolio__heading-block">
            {/* Cycle 31 — gamma-style -6° tilted handwritten accent ABOVE the
                eyebrow. "события" echoes the eyebrow's "События · Избранное"
                but in Marck Script Cyrillic — a different voice (handwritten
                vs formal Barlow). Red, rotated -6°, sized to sit between the
                eyebrow and H2 scales — an editorial marginalia that opens
                the "what we do best" beat with a human handwritten gesture. */}
            <TiltedAccent text="события" className="mb-3 block" />
            <span className="ea-eyebrow">События · Избранное</span>
            <h2
              id="ea-events-portfolio-headline"
              className="ea-section-h2 ea-evt-portfolio__h2"
            >
              {"Что мы умеем "}
              <i className="ea-italic-fragment">лучше всего</i>
              {"."}
            </h2>
            {/* c87 — honest trust beat: все кадры реальные (закрывает
                вопрос c86-CRIT3 о стоке). Короткая сенсорная строка. */}
            <p className="ea-evt-portfolio__sub">
              Все {EVENTS.length} кадров — с наших мероприятий: банкетная
              рассадка, фуршетные линии и подача.
            </p>
          </div>
          <Link
            href="#ea-service-tabs"
            className="ea-text-link ea-evt-portfolio__all-link"
            aria-label="Все события"
          >
            Все события
            <svg
              className="ea-text-link__arrow"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 12h15M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        <ul
          ref={scrollerRef}
          className="ea-evt-portfolio__scroller"
          aria-label="Фотогалерея событий — горизонтальная прокрутка"
          aria-roledescription="carousel"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          tabIndex={0}
        >
          {EVENTS.map((event, i) => (
            <li
              key={event.src}
              className="ea-evt-portfolio__card"
              style={{ "--evt-r": RATIO_NUM[event.ratio] } as React.CSSProperties}
              role="group"
              aria-roledescription="slide"
              aria-label={`Слайд ${i + 1} из ${EVENTS.length}: ${event.title}`}
            >
              {/*
                Cycle 34 WOW graft — sondaven.com alternating directional
                clip-path reveal. Each card's image enters with a different
                clip direction (cycling [bottom, left, top, right] via index%4)
                so the horizontal scroll has rhythm, not a uniform wipe.

                c87: ширина карточки управляется пропорцией кадра через
                CSS-переменную --evt-r (см. ea-events-portfolio.css);
                внутренняя обёртка — h-full/w-full: высота определена
                карточкой (aspect-ratio + width), aspect-класс больше
                не нужен (при смешанных пропорциях он конфликтовал бы).
              */}
              <ClipPathReveal
                direction="alternate"
                index={i}
                duration={0.8}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={event.src}
                    alt={event.alt}
                    fill
                    sizes={SIZES[event.ratio]}
                    className="ea-evt-portfolio__img object-cover"
                    priority={i < 2}
                    quality={82}
                  />
                </div>
              </ClipPathReveal>
              <div className="ea-evt-portfolio__overlay">
                <span className="ea-evt-portfolio__category">
                  {event.category}
                </span>
                <h3 className="ea-evt-portfolio__title">{event.title}</h3>
                <p className="ea-evt-portfolio__meta">{event.meta}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="ea-evt-portfolio__progress-track" aria-hidden="true">
          <div
            className="ea-evt-portfolio__progress-bar"
            style={{
              width: `${Math.max(0.08, Math.min(1, progress)) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default EaEventsPortfolio;

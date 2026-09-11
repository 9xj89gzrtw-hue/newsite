"use client";

/**
 * EaEventsPortfolio — Cycle 28 (EA editorial layer) · Cycle 87 (real photos)
 * -----------------------------------------------------------------------
 * Magazine-style horizontal-scroll gallery with native CSS scroll-snap.
 *
 * REPLACES `mcu-photo-filmstrip.tsx` (Embla filmstrip, broken under React 19
 * per CYCLE-28-COMPONENT-AUDIT.md §3 — score 7/10). No carousel library: pure
 * CSS scroll-snap + a 4.5s auto-advance. Bulletproof on React 19.
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
 *  - Ленивая загрузка: все карточки lazy (секция глубоко ниже фолда;
 *    priority ниже фолда — анти-паттерн Next.js, конфликт с hero-LCP).
 *  - advance() идёт по getBoundingClientRect-дельте следующей карточки —
 *    offsetLeft наследует offsetParent секции и врал (карусель стояла).
 *
 * CYCLE 87-F (волна-1 слепых критиков, 3×REJECT → фиксы):
 *  - F1 [WCAG 2.2.2 + c83-F4b]: автопрокрутку можно поставить на паузу —
 *    pointerenter/focusin гасят тик, pointerleave/focusout возобновляют;
 *    ручной скролл (>30px за rAF-тик при живом интервале, троттлинг 150мс)
 *    перезапускает отсчёт. Дом-listeners напрямую — React-synthetic
 *    mouseenter в headless-прогонах не покрыл карточки-потомки.
 *  - F2 [C2/M1]: стрелки prev/next (паттерн сиблинга events-video-carousel:
 *    44px, data-edge гасит на краях) + End/Home на ленте (раньше уводили
 *    страницу в футер). Колёсная мышь больше не заперта.
 *  - F3 [CRIT3 C1]: reduce-motion ветка заголовка — animate-финал (урок
 *    c83 «FAQ под RM в opacity:0»: initial=false + whileInView=undefined
 *    оставляет inline-стили первого рендера навсегда).
 *  - F4 [CRIT3 M4]: прогресс-бар — прямой DOM-ref (ноль setState на кадр
 *    прокрутки; 44-карточное поддерево больше не ре-рендерится).
 *  - F5: advance доезжает до конца ленты, wrap на 0 — следующим тиком.
 *  - F6 [CRIT2]: «44 кадра» (грамматика), подписи #11/#15/#25/#39 по факту
 *    (автосалон/салон судна/сцена/веранда — VLM-верификация), кропы #35/#44
 *    убирают чужие надписи (Cool'n'Art / экран «logistics»), порядок без
 *    монотонных серий (было 7 портретов подряд в хвосте).
 *
 * EA design language grafted (per docs/EA-ANALYSIS.md §3.11 + §11):
 *  - Cream section bg (var(--ea-cream)) — same as EA's image-shadow tint.
 *  - Italic-as-fragment trailing phrase ("лучше всего" → italic + red).
 *  - Eyebrow (Barlow Semi Condensed Bold) + H2 (Playfair) + ea-text-link.
 *  - Image hover: scale(1.06) over 700ms (EA's 1.1/200ms refined to be quieter).
 *  - Bottom overlay panel (gradient → rgba(0,0,0,0.82)) with category tag +
 *    Playfair title + Montserrat meta — mirrors EA's "Our Events" cards.
 *  - Custom 2px × 100% red progress indicator (EA-red accent line).
 *
 * Motion:
 *  - Auto-advances every 4500ms to the next card's snap edge (конец ленты →
 *    следующий тик wraps на старт).
 *  - Pauses on pointerenter/focusin, resumes on pointerleave/focusout,
 *    manual scroll resets the countdown (c83-F4b).
 *  - Respects `useReducedMotion` — when reduced, no auto-advance.
 *  - Subtle motion.div fade-up on header (respects reduced-motion + F3).
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
 * новые имена — cache-bust §2). Подписи описывают только видимое
 * (VLM-верификация каждой карточки + прицельные прогоны спорных).
 */
const EVENTS: EventCard[] = [
  { src: "/media/c87/real-event-01.webp", ratio: "p", category: "Банкеты", title: "Длинный стол в светлом зале", meta: "рассадка · стекло и свет", alt: "Длинный банкетный стол в светлом зале с сервировкой на каждого гостя" },
  { src: "/media/c87/real-event-02.webp", ratio: "l", category: "Подача", title: "Три подачи на персону", meta: "порционная сервировка", alt: "Индивидуальная порционная сервировка из трёх блюд на белом столе" },
  { src: "/media/c87/real-event-03.webp", ratio: "p", category: "Банкеты", title: "Два яруса, люстры, цветы", meta: "ресторанный зал · ужин всем домом", alt: "Двухъярусный ресторанный зал с цветочным декором и люстрами" },
  { src: "/media/c87/real-event-04.webp", ratio: "p", category: "Фуршеты", title: "Морское на фуршетной линии", meta: "закуски и дары моря", alt: "Фуршетный стол крупным планом — закуски и морепродукты" },
  { src: "/media/c87/real-event-05.webp", ratio: "l", category: "Площадки", title: "Зал с панорамными окнами", meta: "свет со всех сторон", alt: "Банкетный зал с жёлтыми креслами и панорамными окнами" },
  { src: "/media/c87/real-event-06.webp", ratio: "p", category: "Подача", title: "Брускетты с лососем", meta: "хрустящий хлеб · свежая рыба", alt: "Брускетты с лососем и сыром на деревянной доске" },
  { src: "/media/c87/real-event-07.webp", ratio: "p", category: "Банкеты", title: "Зал с высоким потолком", meta: "простор и длинный стол", alt: "Просторный зал с высоким потолком и длинным банкетным столом" },
  { src: "/media/c87/real-event-08.webp", ratio: "s", category: "Подача", title: "Канапе с красной икрой", meta: "праздник на шпажке", alt: "Канапе с красной икрой на шпажках крупным планом" },
  { src: "/media/c87/real-event-09.webp", ratio: "xl", category: "Фуршеты", title: "Панорама фуршета", meta: "линия закусок · высокие столы", alt: "Широкая панорама фуршетного стола с закусками и высокими столиками" },
  { src: "/media/c87/real-event-10.webp", ratio: "p", category: "Банкеты", title: "Сервировка в светлом зале", meta: "банкет накрыт до прихода гостей", alt: "Сервированный банкетный стол с блюдами в светлом зале" },
  { src: "/media/c87/real-event-11.webp", ratio: "l", category: "Площадки", title: "Фуршет в автосалоне", meta: "автомобиль в центре зала", alt: "Фуршетный стол в автосалоне вокруг красного автомобиля, за окнами парковка" },
  { src: "/media/c87/real-event-12.webp", ratio: "s", category: "Подача", title: "Десерты с ягодами", meta: "финал трапезы", alt: "Десерты на шпажках с ягодами крупным планом" },
  { src: "/media/c87/real-event-13.webp", ratio: "p", category: "Площадки", title: "Стол под белым шатром", meta: "приём на природе", alt: "Длинный банкетный стол под белым шатром с белыми стульями" },
  { src: "/media/c87/real-event-14.webp", ratio: "l", category: "Банкеты", title: "Закуски на золотых подставках", meta: "белая скатерть · ярусная подача", alt: "Банкетный стол с белой скатертью и закусками на золотистых подставках" },
  { src: "/media/c87/real-event-15.webp", ratio: "p", category: "Площадки", title: "Салон судна", meta: "панорамные окна · река", alt: "Интерьер судна с панорамными окнами и прозрачной крышей, за окнами река и набережная" },
  { src: "/media/c87/real-event-16.webp", ratio: "s", category: "Подача", title: "Канапе с лососем", meta: "рыба и свежесть", alt: "Канапе с лососем на шпажках крупным планом" },
  { src: "/media/c87/real-event-17.webp", ratio: "l", category: "Площадки", title: "Терраса над водой", meta: "чёрная скатерть · отражения", alt: "Банкет на террасе с видом на воду, столы с чёрными скатертями" },
  { src: "/media/c87/real-event-18.webp", ratio: "p", category: "Банкеты", title: "Цветы и свечи", meta: "тёплый свет вдоль стола", alt: "Длинный банкетный стол с цветочными композициями и свечами" },
  { src: "/media/c87/real-event-19.webp", ratio: "s", category: "Подача", title: "Салаты в стаканах", meta: "прозрачная подача", alt: "Прозрачные стаканчики с мясными салатами крупным планом" },
  { src: "/media/c87/real-event-20.webp", ratio: "l", category: "Площадки", title: "Лофт с кирпичной стеной", meta: "станция блюд и напитков", alt: "Кейтеринг в помещении с кирпичной стеной — стойка с напитками и едой" },
  { src: "/media/c87/real-event-21.webp", ratio: "p", category: "Банкеты", title: "Длинный стол в салоне", meta: "закуски, посуда, бокалы", alt: "Длинный банкетный стол с закусками, посудой и бокалами в светлом салоне" },
  { src: "/media/c87/real-event-22.webp", ratio: "p", category: "Подача", title: "Тарталетки на подносе", meta: "чёрно-белый кадр", alt: "Чёрно-белое фото тарталеток на подносе" },
  { src: "/media/c87/real-event-23.webp", ratio: "l", category: "Банкеты", title: "Круглый стол у окна", meta: "белая скатерть · дневной свет", alt: "Круглый банкетный стол у окна с белой скатертью" },
  { src: "/media/c87/real-event-24.webp", ratio: "s", category: "Подача", title: "Канапе с ветчиной и сыром", meta: "плотная классика фуршета", alt: "Канапе с ветчиной и сыром на шпажках крупным планом" },
  { src: "/media/c87/real-event-25.webp", ratio: "l", category: "Банкеты", title: "Белая скатерть, золотые тарелки", meta: "банкетная сервировка", alt: "Накрытый банкетный стол с белой скатертью, золотистыми тарелками и бокалами" },
  { src: "/media/c87/real-event-26.webp", ratio: "p", category: "Банкеты", title: "Официант у десертного стола", meta: "финальная подача вечера", alt: "Официант у стола с десертами в богато украшенном зале" },
  { src: "/media/c87/real-event-27.webp", ratio: "s", category: "Подача", title: "Канапе на шпажках", meta: "линия закусок", alt: "Канапе с рыбой на шпажках крупным планом" },
  { src: "/media/c87/real-event-28.webp", ratio: "l", category: "Площадки", title: "Белые шатры", meta: "чёрно-белый кадр · геометрия", alt: "Белые шатры на открытом воздухе — художественная чёрно-белая фотография" },
  { src: "/media/c87/real-event-29.webp", ratio: "l", category: "Банкеты", title: "Зелёная скатерть", meta: "приборы выровнены в линейку", alt: "Банкетный стол с зелёной скатертью и сервировкой" },
  { src: "/media/c87/real-event-30.webp", ratio: "p", category: "Банкеты", title: "Золотые тарелки", meta: "круглый стол · тёплый металл", alt: "Круглый стол с золотистыми тарелками и цветами" },
  { src: "/media/c87/real-event-31.webp", ratio: "s", category: "Подача", title: "Канапе с ветчиной и огурцом", meta: "свежий хруст", alt: "Канапе с ветчиной и огурцами на шпажках крупным планом" },
  { src: "/media/c87/real-event-32.webp", ratio: "p", category: "Фуршеты", title: "Закуски и десерты на линии", meta: "длинный фуршетный стол", alt: "Длинный стол с закусками, десертами и цветами" },
  { src: "/media/c87/real-event-33.webp", ratio: "p", category: "Банкеты", title: "Цветочная композиция", meta: "центр во весь стол", alt: "Длинный банкетный стол с обильной цветочной композицией по центру" },
  { src: "/media/c87/real-event-34.webp", ratio: "l", category: "Фуршеты", title: "Лофт-бар", meta: "бокалы, цветы, бутылки", alt: "Чёрный фуршетный стол с бокалами, цветами и бутылками в стиле лофт" },
  { src: "/media/c87/real-event-35.webp", ratio: "p", category: "Фуршеты", title: "Канапе и цветы", meta: "фуршетная линия", alt: "Фуршетный стол с канапе и цветами" },
  { src: "/media/c87/real-event-36.webp", ratio: "p", category: "Банкеты", title: "Цветы в стеклянных вазах", meta: "декор, который дышит", alt: "Стол с цветочными композициями в стеклянных вазах" },
  { src: "/media/c87/real-event-37.webp", ratio: "l", category: "Площадки", title: "Площадка под навесом", meta: "фуршет готов к приезду гостей", alt: "Площадка под тентом с высокими столиками для мероприятия" },
  { src: "/media/c87/real-event-38.webp", ratio: "p", category: "Фуршеты", title: "Длинная фуршетная линия", meta: "закуски и цветы в ритме", alt: "Длинный фуршетный стол с закусками и цветами" },
  { src: "/media/c87/real-event-39.webp", ratio: "p", category: "Банкеты", title: "Веранда сверху", meta: "гирлянды · белые скатерти", alt: "Терраса с гирляндами и длинными столами в белых скатертях, вид сверху" },
  { src: "/media/c87/real-event-40.webp", ratio: "xl", category: "Банкеты", title: "Красные скатерти", meta: "блюда и напитки вдоль столов", alt: "Длинные банкетные столы с красными скатертями, блюдами и напитками" },
  { src: "/media/c87/real-event-41.webp", ratio: "p", category: "Фуршеты", title: "Вечер в полумраке", meta: "гости у столов · тёмный кадр", alt: "Вечернее мероприятие — гости у фуршетных столов в полутёмном зале" },
  { src: "/media/c87/real-event-42.webp", ratio: "p", category: "Фуршеты", title: "Цветы вдоль линии", meta: "мягкий фон · тёплый свет", alt: "Фуршетный стол с закусками и цветами" },
  { src: "/media/c87/real-event-43.webp", ratio: "p", category: "Фуршеты", title: "Стол с подсветкой", meta: "декор и свет линии", alt: "Длинный фуршетный стол с подсветкой и декором" },
  { src: "/media/c87/real-event-44.webp", ratio: "xl", category: "Банкеты", title: "Круглый стол в зелёном свете", meta: "вечерний кадр", alt: "Накрытый круглый стол с посудой и зелёной подсветкой — вечерний кадр" },
];

export function EaEventsPortfolio() {
  const reduce = useReducedMotion();
  // C62 hydration-safety: entrance props serialize into SSR HTML — the reduce
  // branch resolves only after mount (direct branch = mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceSettled = mounted && reduce;
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /* F8: состояние присутствия пользователя на ленте — старт-гейты
   * автопрокрутки (мышь внутри / фокус внутри). */
  const pointerInsideRef = useRef(false);
  const focusWithinRef = useRef(false);
  /* F8-NIT: гейт «это наш собственный программный скролл» — собственный
   * тик не должен перезапускать отсчёт (период уплывал 4.5→5.0с). */
  const programmaticUntilRef = useRef(0);
  /* F8: дебаунс возобновления — скролл-чорн Chrome гоняет
   * pointerleave→pointerenter пары под покоящейся мышью; 250мс
   * отсекает ложные «уходы». */
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  /* F1: startAuto в scroll-listener'е вызывается из rAF-тика — держим
     свежую ссылку (useCallback-идентичность стабильна, но ref-паттерн
     сиблинга events-video-carousel не зависит от deps-пересборки). */
  const startAutoRef = useRef<() => void>(() => {});
  /* F4: atStart/atEnd для стрелок — setState ТОЛЬКО при смене края
     (не на кадр). Прогресс-бар — прямой DOM-ref, ноль setState на кадр. */
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /**
   * Позиция цели прокрутки: следующая (dir=+1) / предыдущая (dir=-1)
   * карточка относительно текущего вида. Считается ЧЕРЕЗ
   * getBoundingClientRect-дельту относительно скроллера: offsetLeft
   * карточек наследует offsetParent секции (скроллер position:static)
   * и врал на ~padding — advance «промахивался» в snap-точку 0 и
   * карусель стояла (найдено Playwright-замером: scrollLeft не менялся
   * 10с при живом интервале). Возвращает null, когда края нет.
   */
  const edgeTarget = useCallback((dir: 1 | -1): number | null => {
    const scroller = scrollerRef.current;
    if (!scroller) return null;
    const cards = scroller.querySelectorAll<HTMLElement>(
      ".ea-evt-portfolio__card",
    );
    if (!cards.length) return null;
    const base = scroller.getBoundingClientRect().left;
    let target: number | null = null;
    if (dir === 1) {
      for (const card of Array.from(cards)) {
        const rel = card.getBoundingClientRect().left - base;
        if (rel > 8) {
          target = Math.round(scroller.scrollLeft + rel);
          break;
        }
      }
    } else {
      for (const card of Array.from(cards).reverse()) {
        const rel = card.getBoundingClientRect().left - base;
        if (rel < -8) {
          target = Math.round(scroller.scrollLeft + rel);
          break;
        }
      }
    }
    return target;
  }, []);

  /**
   * c87-F5: доезжаем до конца ленты, wrap на старт — СЛЕДУЮЩИМ тиком
   * (раньше джамп-кат из предпоследней позиции; урок c83 — end-детект
   * по фактической позиции, не по «шаг ≥ max»).
   */
  const advance = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (max <= 0) return;
    if (scroller.scrollLeft >= max - 4) {
      programmaticUntilRef.current = performance.now() + 900;
      scroller.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const target = edgeTarget(1);
    programmaticUntilRef.current = performance.now() + 900;
    if (target === null || target >= max - 4) {
      scroller.scrollTo({ left: max, behavior: "smooth" });
    } else {
      scroller.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [edgeTarget]);

  const startAuto = useCallback(() => {
    if (reduce) return;
    /* F8 (волна-2, hover-гонка): IO-старт/скролл-чорн не должны заводить
     * автоплей под покоящейся мышью или фокусом — стартуем ТОЛЬКО когда
     * лента свободна от пользователя. Замер критика: мышь на ленте до
     * IO-старта → интервал заводился и pointerenter уже не приходил. */
    if (pointerInsideRef.current || focusWithinRef.current) return;
    if (document.hidden) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, AUTOPLAY_MS);
  }, [advance, reduce]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoRef.current = startAuto;
  }, [startAuto]);

  /** F2: стрелки — переход на край соседней карточки + сброс отсчёта.
   *  F8-D2 (волна-2): под reduce — мгновенно (сиблинг: instant-ветка). */
  const goTo = useCallback(
    (dir: 1 | -1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      const target = edgeTarget(dir);
      if (target === null) return;
      programmaticUntilRef.current = performance.now() + 900;
      scroller.scrollTo({
        left: Math.max(0, Math.min(max, target)),
        behavior: reduce ? "auto" : "smooth",
      });
      if (intervalRef.current) startAuto();
    },
    [edgeTarget, reduce, startAuto],
  );

  // Start autoplay + pause when offscreen (perf).
  useEffect(() => {
    if (reduce) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const section = scroller.closest("section");
    /* F8-D3 (волна-2): латентная утечка — безсекционная ветка стартовала
     * интервал БЕЗ cleanup. Секция всегда есть (это наш собственный
     * <section>), но гигиена обязана быть полной. */
    if (!section) {
      startAuto();
      return () => stopAuto();
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startAuto();
        else stopAuto();
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    /* F8-NIT (волна-2): скрытая вкладка — пауза (IO не реагирует на
     * visibility, интервал тикал бы в фоне). */
    const onVis = () => {
      if (document.hidden) stopAuto();
      else startAuto();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stopAuto();
    };
  }, [reduce, startAuto, stopAuto]);

  /**
   * F1 [WCAG 2.2.2 + c83-F4b] + F8 (волна-2, hover-гонка): пауза/сброс
   * автопрокрутки. Дом-listeners напрямую:
   *  - pointerenter → пауза; pointerleave → возобновление ЧЕРЕЗ ДЕБАУНС
   *    250мс (Chrome при автоскролле ленты гонит pointerleave→pointerenter
   *    пары под покоящейся мышью — мгновенный рестарт ломал паузу);
   *  - focusin → пауза, focusout → возобновление (клавиатура/ридер);
   *  - End/Home — и на ленте, и на стрелках (D4: фокус на кнопке — End
   *    уводил СТРАНИЦУ в футер).
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    const nav = navRef.current;
    if (!scroller) return;
    /* F8: стартовое состояние — мышь, покоящаяся на ленте ДО монтирования,
     * невидима для событий (pointerenter не приедет): читаем фактическое
     * CSS-состояние :hover / document.activeElement — оно всегда правдиво. */
    pointerInsideRef.current = scroller.matches(":hover");
    focusWithinRef.current =
      scroller.contains(document.activeElement) ||
      !!nav?.contains(document.activeElement);
    if (pointerInsideRef.current || focusWithinRef.current) stopAuto();
    const scheduleResume = () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        resumeTimerRef.current = null;
        startAuto();
      }, 250);
    };
    const cancelResume = () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };
    const onPointerEnter = () => {
      pointerInsideRef.current = true;
      cancelResume();
      stopAuto();
    };
    const onPointerLeave = () => {
      pointerInsideRef.current = false;
      scheduleResume();
    };
    const onFocusIn = () => {
      focusWithinRef.current = true;
      cancelResume();
      stopAuto();
    };
    const onFocusOut = () => {
      focusWithinRef.current = false;
      scheduleResume();
    };
    const onKey = (e: KeyboardEvent) => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (e.key === "End" && max > 0) {
        e.preventDefault();
        programmaticUntilRef.current = performance.now() + 900;
        scroller.scrollTo({ left: max, behavior: "auto" });
        if (intervalRef.current) startAuto();
      } else if (e.key === "Home" && scroller.scrollLeft > 0) {
        e.preventDefault();
        programmaticUntilRef.current = performance.now() + 900;
        scroller.scrollTo({ left: 0, behavior: "auto" });
        if (intervalRef.current) startAuto();
      }
    };
    scroller.addEventListener("pointerenter", onPointerEnter);
    scroller.addEventListener("pointerleave", onPointerLeave);
    scroller.addEventListener("focusin", onFocusIn);
    scroller.addEventListener("focusout", onFocusOut);
    scroller.addEventListener("keydown", onKey);
    nav?.addEventListener("keydown", onKey);
    return () => {
      scroller.removeEventListener("pointerenter", onPointerEnter);
      scroller.removeEventListener("pointerleave", onPointerLeave);
      scroller.removeEventListener("focusin", onFocusIn);
      scroller.removeEventListener("focusout", onFocusOut);
      scroller.removeEventListener("keydown", onKey);
      nav?.removeEventListener("keydown", onKey);
      cancelResume();
    };
  }, [startAuto, stopAuto]);

  /**
   * F4: скролл-поток — прогресс-бар через ПРЯМОЙ DOM-ref (ноль setState
   * на кадр: 44-карточное поддерево не ре-рендерится; доктрина сайта
   * «ноль setState на кадр» из site-footer). Тот же поток считает
   * atStart/atEnd для стрелок (setState только при СМЕНЕ края) и ловит
   * ручной скролл для сброса отсчёта (F1).
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let ticking = false;
    let lastLeft = scroller.scrollLeft;
    let lastSwipeRestartAt = 0;
    const measure = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const left = scroller.scrollLeft;
      const delta = left - lastLeft;
      lastLeft = left;
      const now = performance.now();
      /* F8-NIT: собственный программный скролл (advance/goTo/End/Home)
         не перезапускает отсчёт — период остаётся честным 4.5с. */
      if (
        Math.abs(delta) > 30 &&
        intervalRef.current &&
        now > programmaticUntilRef.current
      ) {
        if (now - lastSwipeRestartAt > 150) {
          lastSwipeRestartAt = now;
          startAutoRef.current();
        }
      }
      const start = left <= 4;
      const end = max <= 0 || left + scroller.clientWidth >= scroller.scrollWidth - 4;
      setAtStart((prev) => (prev === start ? prev : start));
      setAtEnd((prev) => (prev === end ? prev : end));
      if (progressBarRef.current) {
        const pct = max > 0 ? left / max : 0;
        progressBarRef.current.style.width = `${Math.max(0.08, Math.min(1, pct)) * 100}%`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
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
          /* F3 [c83-урок]: RM-ветка обязана иметь animate-финал — иначе
             inline-стили первого рендера (opacity:0/y:24) висят навсегда
             (заголовок невидим под prefers-reduced-motion). */
          animate={reduceSettled ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-60px" }}
          transition={
            reduceSettled ? { duration: 0 } : { duration: 0.7, ease: EASE }
          }
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
              Все {EVENTS.length} кадра — с наших мероприятий: банкетная
              рассадка, фуршетные линии и подача.
            </p>
          </div>
          <Link
            href="#services"
            className="ea-text-link ea-evt-portfolio__all-link"
            aria-label="Все события — форматы обслуживания"
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
                Все карточки lazy: секция глубоко ниже фолда, priority
                здесь — анти-паттерн (конкуренция preload с hero-LCP).
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
                    quality={82}
                  />
                </div>
              </ClipPathReveal>
              <div className="ea-evt-portfolio__overlay">
                <span className="ea-evt-portfolio__category">
                  {event.category}
                </span>
                <p className="ea-evt-portfolio__title">{event.title}</p>
                <p className="ea-evt-portfolio__meta">{event.meta}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* F2: стрелки prev/next — паттерн сиблинга events-video-carousel
            (81-F2): на краю трека стрелка гаснет (opacity 40% +
            pointer-events: none — CSS [data-edge="true"]); клик сбрасывает
            отсчёт автопрокрутки (goTo → startAuto). Колёсная мышь больше
            не заперта в ленте. */}
        <div className="ea-evt-portfolio__nav" ref={navRef}>
          <button
            type="button"
            className="ea-evt-portfolio__nav-btn"
            data-edge={atStart ? "true" : undefined}
            aria-disabled={atStart || undefined}
            data-press
            onClick={() => {
              if (atStart) return;
              goTo(-1);
            }}
            aria-label="Предыдущее фото"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="ea-evt-portfolio__nav-btn"
            data-edge={atEnd ? "true" : undefined}
            aria-disabled={atEnd || undefined}
            data-press
            onClick={() => {
              if (atEnd) return;
              goTo(1);
            }}
            aria-label="Следующее фото"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="ea-evt-portfolio__progress-track" aria-hidden="true">
          <div
            ref={progressBarRef}
            className="ea-evt-portfolio__progress-bar"
            style={{ width: "8%" }}
          />
        </div>
      </div>
    </section>
  );
}

export default EaEventsPortfolio;

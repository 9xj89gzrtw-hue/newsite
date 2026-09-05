"use client";

/**
 * EventsVideoCarousel — Section #9 of the new site structure.
 * ----------------------------------------------------------------------------
 * Horizontal carousel of 4 event-type video tiles. Pure CSS scroll-snap
 * + a 5s auto-advance `useEffect`. Clicking a tile opens a fullscreen
 * modal with the full video unmuted + native controls + Escape-to-close.
 *
 * FORKED FROM `ea-events-portfolio.tsx` (Cycle 28 EA editorial layer) —
 * same bulletproof no-library approach: native CSS scroll-snap-x mandatory,
 * pause-on-mouseenter, IntersectionObserver-gated autoplay for perf,
 * `useReducedMotion` short-circuit. Adds: `<video>` instead of `<Image>`,
 * click-to-expand modal, Escape key handler, custom scrollbar styling.
 *
 * EA design language grafted:
 *  - Cream section bg (var(--ea-cream)).
 *  - (Task 4-B: the TiltedAccent handwritten marginalia + the word
 *    «кухня» in copy were removed at the owner's request — the eyebrow
 *    now opens the beat directly.)
 *  - Italic-as-fragment H2 ("События, которые мы *создаём*." → italic + red).
 *  - Eyebrow (Barlow Semi Condensed Bold) + H2 (Playfair) + meta (Poppins).
 *  - Bottom overlay panel (gradient → rgba(0,0,0,0.78)) with category tag +
 *    Playfair title + meta — mirrors EA's "Our Events" cards.
 *  - Custom 2px × 100% red progress indicator.
 *  - ggcatering-style play-pill CTA overlay on each tile (1px solid white,
 *    radius 9999px, padding 8px/16px) — clicking opens the modal.
 *
 * Source strategy: we don't have separate per-event video clips, so the
 * two existing repo teaser videos (mculinary-hero.mp4 + gg-hero-video.mp4)
 * are REUSED in rotation across the 4 tiles. Posters come from the existing
 * /media/event-0[1-4].{png,jpg} assets.
 *
 * Motion:
 *  - Auto-advances every 5000ms — c83-F3: на следующую snap-точку трека
 *    (не cardWidth+gap), wrap на 0 только с последней точки.
 *  - Pauses on mouseenter, resumes on mouseleave.
 *  - Respects `useReducedMotion` — when reduced, no auto-advance.
 *  - Subtle motion.div fade-up on header (respects reduced-motion).
 *  - Pauses autoplay entirely while the modal is open (activeIndex !== null).
 *
 * W4-FIX (hover-тизер): every tile renders a <video muted loop playsInline
 * preload="none"> ON TOP of its poster (the video's own poster attribute
 * shows the identical frame, so the static look is unchanged). The teaser
 * plays ONLY on card hover, ONLY on fine-pointer devices
 * (matchMedia("(hover: hover) and (pointer: fine)")), ONLY while the section
 * is intersecting the viewport (IO gate) and NEVER more than one at a time
 * (entering a card pauses its siblings). preload="none" keeps the mp4s out
 * of the network until the first hover; coarse-pointer (touch) users see
 * the static poster; prefers-reduced-motion disables hover videos entirely.
 * The modal (unmuted + controls) and the «Смотреть видео» pill are unchanged.
 *
 * Mobile: STILL horizontal scroll — no grid collapse. This is the magazine
 * horizontal-read signature (per EA + Ridgewells editorial layer brief).
 *
 * Self-contained: scoped CSS in `./events-video-carousel.css`. No edits
 * to globals.css, no edits to any other catering/*.tsx file.
 *
 * @see ea-events-portfolio.tsx (fork source — carousel mechanics)
 * @see ea-venues-spotlight.tsx (style reference — header + tile composition)
 * @see docs/reference-library/elegant-affairs/BRAND-CONTEXT.md §2.5
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";

import { ClipPathReveal } from "@/components/motion/clip-path-reveal";
import "./events-video-carousel.css";

/** EA Easing — quiet cubic-bezier used across the editorial layer. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Auto-advance interval in milliseconds. */
const AUTOPLAY_MS = 5000;

type EventTile = {
  /** Background teaser video — looping muted autoplay. */
  video: string;
  /** Poster image — shown before video loads (and as fallback). */
  poster: string;
  /** Category tag (Barlow Semi Condensed Bold uppercase, var(--ea-red)). */
  category: string;
  /** Title (Playfair Display 1.5rem white). */
  title: string;
  /** Meta line (Poppins 0.85rem white/70) — venue · guest count. */
  meta: string;
  /** aria-label for the `<video>` element describing its content. */
  videoAlt: string;
};

/**
 * 4 tiles with genuinely DIFFERENT video clips (Cycle 39 honesty fix:
 * previously all 4 tiles opened the same full video while captions
 * promised different event stories). The mculinary b-roll (28s) is cut
 * into 4 unique 7-second fragments via ffmpeg — each tile opens its own
 * clip in a fullscreen modal: crostini appetizers / tortellini / dessert /
 * plated main. Posters come from /media/event-0[1-4] assets.
 */
const TILES: EventTile[] = [
  {
    video: "/media/clips/catering-clip-1.mp4",
    poster: "/media/event-01.png",
    category: "Закуски",
    title: "Кростини и канапе",
    meta: "Старт банкета · первая подача",
    videoAlt: "Видео: кростини с топпингами — подача закусок",
  },
  {
    video: "/media/clips/catering-clip-2.mp4",
    poster: "/media/event-02.jpg",
    category: "Горячее",
    title: "Тортелини с овощами",
    meta: "Основная подача · в работе",
    videoAlt: "Видео: тортелини с овощами — горячая подача",
  },
  {
    video: "/media/clips/catering-clip-3.mp4",
    poster: "/media/event-03.jpg",
    category: "Десерты",
    title: "Меренга и мороженое",
    meta: "Финал трапезы · авторский десерт",
    videoAlt: "Видео: десерт с меренгой и мороженым",
  },
  {
    video: "/media/clips/catering-clip-4.mp4",
    poster: "/media/event-04.jpg",
    category: "Мастерство шефа",
    title: "Авторское горячее",
    meta: "Мясо с гарниром · порционная подача",
    videoAlt: "Видео: авторское горячее блюдо с мясом и гарниром",
  },
];

export function EventsVideoCarousel() {
  const reduce = useReducedMotion();
  // C62 hydration-safety: entrance props serialize into SSR HTML — the
  // reduce branch resolves only after mount (direct branch = mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceSettled = mounted && reduce;
  const scrollerRef = useRef<HTMLUListElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);
  /* 81-F2: края трека — гашение стрелок (см. скролл-эффект ниже). */
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** activeIndex !== null → fullscreen modal open with that tile's video. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /* ── 81-W2F1 (критик F MEDIUM, модалка без Play-аффорданса) ────────
   *
   * Модальное видео открывается со звуком (unmuted autoplay) — браузеры
   * без жеста пользователя отвергают его: видео стоит НА ПАУЗЕ, а
   * единственным намёком оставался крестик (замер критика F). Теперь
   * поверх видео — центр-оверлей Play-кнопка (lucide Play, 64px ≥ 44px
   * тач-таргет, aria-label «Смотреть видео»): клик = video.play()
   * (клик — жест, звук разрешён). onPlay прячет оверлей навсегда — и
   * если autoplay всё же сработал (жест клика по плитке), и если юзер
   * нажал нативный Play в controls. Повторной паузе оверлей НЕ
   * возвращается — нативные controls уже дают resume. */
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [modalPlayed, setModalPlayed] = useState(false);
  useEffect(() => {
    if (activeIndex !== null) setModalPlayed(false);
  }, [activeIndex]);

  /* ── W4-FIX: hover-видео-тизеры (десктоп, fine pointer) ─────────────────
   *
   * Per-tile teaser <video> elements (see the <li> render below). The gate
   * resolves once on the client — it only affects event-handler behaviour,
   * never the rendered DOM, so SSR/hydration markup stays identical. */
  const sectionRef = useRef<HTMLElement | null>(null);
  const hoverVideosRef = useRef<Array<HTMLVideoElement | null>>([]);
  const inViewRef = useRef(false);
  const canHoverVideo = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    [],
  );

  /** React doesn't serialize the `muted` attribute into SSR HTML — pin the
   *  DOM property on mount so hover play() (muted) is never rejected. */
  useEffect(() => {
    hoverVideosRef.current.forEach((v) => {
      if (v) v.muted = true;
    });
  }, []);

  /** IO-гейт: вне вьюпорта тизеры не играют ВООБЩЕ — при выходе гасим все
   *  (в т.ч. случайно оставшийся играющим) и запрещаем новый hover-play. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inViewRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          hoverVideosRef.current.forEach((v) => {
            if (v && !v.paused) v.pause();
          });
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  /** Hover = ровно ОДНО играющее видео: вход в карточку ставит её и глушит
   *  остальных; выход — пауза этой. Гейты: fine pointer, не reduced-motion,
   *  секция в вьюпорте, модалка закрыта. */
  const playHoverVideo = (i: number) => {
    if (!canHoverVideo || reduce || activeIndex !== null) return;
    if (!inViewRef.current) return;
    hoverVideosRef.current.forEach((v, j) => {
      if (!v) return;
      if (j === i) {
        if (v.paused) {
          void v.play().catch(() => {
            /* rejected — the static poster stays */
          });
        }
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  const pauseHoverVideo = (i: number) => {
    const v = hoverVideosRef.current[i];
    if (v && !v.paused) v.pause();
  };

  /** Модалка открыта — её видео (со звуком) должно играть одно: глушим
   *  hover-тизеры. */
  const pauseHoverVideos = useCallback(() => {
    hoverVideosRef.current.forEach((v) => {
      if (v && !v.paused) v.pause();
    });
  }, []);

  /* ── c83-F3 (MAJOR, «клик стрелки сбрасывается») ────────────────────────
   *
   * Root cause: обе прокрутки — стрелки и 5s-auto-advance — целились в
   * арифметику `scrollLeft ± (cardWidth + gap)`, а wrap-эвристика
   * `scrollLeft + delta >= max - 4` считала «конец» из ЛЮБОЙ позиции,
   * когда остаток трека меньше ширины карты (десктоп: 4×320+3×24=1352
   * при clientWidth 1272 → max=80; 0+344 ≥ 76 → «конец»). Каждый тик
   * таймер заворачивал scrollTo(0) поверх позиции пользователя, а клик
   * стрелки отсчёт НЕ сбрасывал — тик попадал в середину smooth-полёта
   * (rAF-лог критика: 0→80→0, возврат за 0.7–2с).
   *
   * Фикс: обе прокрутки идут ТОЛЬКО на реальные snap-точки — старты
   * карточек, клампнутые в [0..max] (клампнутый старт последней карты
   * == max; Chromium держит его валидной snap-позицией, замер
   * research/c83-f3/carousel-isolate.js). Wrap — только когда следующей
   * точки нет. Клик стрелки перезапускает 5s-отсчёт (таймер больше не
   * стреляет в полёт). Геометрия читается по факту — работает при любом
   * вьюпорте/ресайзе, IO-edge-состояния стрелок не тронуты. */
  const snapPoints = useCallback((): number[] => {
    const scroller = scrollerRef.current;
    if (!scroller) return [];
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const base = scroller.getBoundingClientRect().left;
    const pts = new Set<number>();
    scroller
      .querySelectorAll<HTMLElement>(".ea-evt-video__card")
      .forEach((card) => {
        const p = Math.round(
          card.getBoundingClientRect().left - base + scroller.scrollLeft,
        );
        pts.add(Math.min(Math.max(p, 0), max));
      });
    return [...pts].sort((a, b) => a - b);
  }, []);

  const advance = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (scroller.scrollWidth - scroller.clientWidth <= 0) return;
    const next = snapPoints().find((p) => p > scroller.scrollLeft + 4);
    // At the last snap point → wrap to the start (continuous-loop illusion).
    scroller.scrollTo({ left: next ?? 0, behavior: reduce ? "instant" : "smooth" });
  }, [snapPoints, reduce]);

  const startAuto = useCallback(() => {
    // No autoplay under reduced-motion OR while modal is open.
    if (reduce) return;
    if (activeIndex !== null) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(advance, AUTOPLAY_MS);
  }, [advance, reduce, activeIndex]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /* c83-F4b (критик-P2): свежий startAuto для скролл-листенера ниже — его
     эффект подписки живёт с deps [] (переподписка на каждый флип
     activeIndex не нужна), поэтому берём через ref (паттерн closeModalRef).
     Без него замыкание застяло бы на старом activeIndex. */
  const startAutoRef = useRef(startAuto);
  useEffect(() => {
    startAutoRef.current = startAuto;
  }, [startAuto]);

  /* c83-F3: snap-aware arrow navigation — prev/next на соседнюю snap-точку
   * (не scrollBy ± cardWidth). Перезапускает 5s-отсчёт (только если
   * авто-прокрутка сейчас активна — паузы IO/mouseEnter не нарушаем). */
  const goTo = useCallback(
    (dir: 1 | -1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) return;
      const pts = snapPoints();
      const cur = scroller.scrollLeft;
      const target =
        dir === 1
          ? pts.find((p) => p > cur + 4)
          : [...pts].reverse().find((p) => p < cur - 4) ?? 0;
      if (target === undefined) return; // edge clamp — no further snap point
      scroller.scrollTo({ left: target, behavior: reduce ? "instant" : "smooth" });
      if (intervalRef.current) startAuto();
    },
    [snapPoints, reduce, startAuto],
  );

  // Start autoplay + pause when offscreen (perf). Re-runs when modal state
  // changes so opening/closing the modal cleanly pauses/resumes autoplay.
  useEffect(() => {
    if (reduce) return;
    if (activeIndex !== null) {
      stopAuto();
      return;
    }
    const scroller = scrollerRef.current;
    if (!scroller) {
      startAuto();
      return;
    }
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
  }, [reduce, activeIndex, startAuto, stopAuto]);

  // Scroll-progress bar — rAF-throttled to keep scroll perf clean.
  // 81-F2 (критик B, стрелки на краях): тот же скролл-поток считает
  // atStart/atEnd — стрелки гаснут (opacity 40% + pointer-events none),
  // когда скроллить в эту сторону больше нечего (трек упирается в край:
  // scrollLeft ≤ 4 / scrollLeft+clientWidth ≥ scrollWidth-4). Автопрокрутка
  // с wrap-around обновляет состояния через те же события. ResizeObserver
  // пересчитывает после ресайза/поворота.
  // c83-F4b (критик-P2): ручной свайп сбрасывает 5s-отсчёт — как клик
  // стрелки (goTo). Порог 30px за rAF-тик отличает жест пользователя
  // (колесо/флик дают ≥50px за кадр) от хвостовых дрейфов инерции (<10px);
  // перезапуск ТОЛЬКО при живом intervalRef — паузы IO/hover/модалки не
  // трогаем (там interval=null и стартовать нельзя). Отсчёт 5с пойдёт от
  // последнего крупного кадра свайпа — тик не попадёт в разгар инерции.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let ticking = false;
    let lastLeft = scroller.scrollLeft;
    /* c83-F5b (критик волна-3, LOW): timestamp-гейт перезапуска авто-тика.
       Быстрый скролл даёт крупные Δ на КАЖДОМ rAF-кадре (~60/с) — без
       гейта startAuto (clearInterval+setInterval) дёргался бы ~60 раз/с
       (чаттер таймеров). 150мс-троттлинг: перезапуск максимум раз в 150мс;
       суть c83-F4b сохранена — последний перезапуск случится ≤150мс после
       последнего крупного кадра свайпа, 5с-отсчёт не тикнет в моментум. */
    let lastSwipeRestartAt = 0;
    const measure = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const left = scroller.scrollLeft;
      const delta = left - lastLeft;
      lastLeft = left;
      if (Math.abs(delta) > 30 && intervalRef.current) {
        const now = performance.now();
        if (now - lastSwipeRestartAt > 150) {
          lastSwipeRestartAt = now;
          startAutoRef.current();
        }
      }
      setAtStart(left <= 4);
      setAtEnd(max <= 0 || left + scroller.clientWidth >= scroller.scrollWidth - 4);
      const pct = max > 0 ? left / max : 0;
      setProgress(pct);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(scroller);
    measure();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
  }, []);

  /* Latest closeModal for the ESC listener — assigned in an effect that
     lives after closeModal's declaration (see below). */
  const closeModalRef = useRef<() => void>(() => {});

  // Escape key closes the open modal. Locks body scroll while modal is open
  // so the background doesn't scroll behind the overlay.
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      /* Cycle 42 fix: route ESC through closeModal so focus returns to
         the opener tile (setActiveIndex(null) bypassed the return). */
      if (e.key === "Escape") {
        e.preventDefault();
        closeModalRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  // Cycle 39 a11y fix: move focus into the modal when it opens and keep it
  // trapped while open (Tab cycles close → video → caption → close).
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const videoWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (activeIndex === null) return;
    closeRef.current?.focus();
  }, [activeIndex]);
  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !videoWrapRef.current) return;
    const focusables = Array.from(
      videoWrapRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], video[controls], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Cycle 40 a11y: remember which tile opened the modal so focus returns
  // there on close (previously focus fell to <body> — keyboard users lost
  // their place on the page).
  // K7-FIX (P2 / 2.4.3): замер критика — Esc закрывает, но фокус всё равно
  // в BODY. Причина №1: openerRef брался из document.activeElement — а это
  // не работает для JS-кликов (element.click() не фокусирует) и в Safari
  // (кнопки не получают фокус от мыши) → ref пуст → возврат молча пропадал.
  // Лечение: открывашка передаётся ЯВНО из onClick (event.currentTarget).
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const openModal = useCallback(
    (i: number, opener?: HTMLButtonElement | null) => {
      pauseHoverVideos();
      openerRef.current = opener ?? null;
      setActiveIndex(i);
    },
    [pauseHoverVideos],
  );
  // K7-FIX (P2): возврат фокуса — двойной rAF. Первый rAF в React 18 может
  // успеть ДО коммита снятия модалки (concurrent-планировщик): фокус ставился
  // ещё при живой модалке, а затем фокусный узел размонтировался → браузер
  // снова ронял фокус в BODY. Второй rAF всегда ПОСЛЕ коммита — модалки в
  // DOM нет, фокус падает на живую кнопку-открывашку. Анимация закрытия —
  // чистая fade-размонтировка (240ms), фокус не конкурирует с ней.
  const closeModal = useCallback(() => {
    setActiveIndex(null);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        openerRef.current?.focus({ preventScroll: false });
      });
    });
  }, []);
  useEffect(() => {
    closeModalRef.current = closeModal;
  }, [closeModal]);

  /* 81-F2 (критик B, a11y модалки): фон под диалогом глохнет. Паттерн
   * site-header.tsx:419 (inert={open} aria-hidden={open} на хедере при
   * открытом бургере) — но шапка владеет СВОИМ элементом, а модалка здесь
   * должна заглушить ЧУЖИЕ корневые слои: <main> и <header>. Отсюда два
   * решения:
   *  (1) модалка рендерится ЧЕРЕЗ createPortal(document.body) — иначе
   *      inert на <main> погасил бы и её саму (она живёт внутри секции
   *      внутри main); fixed-позиция от портала не меняется (предки без
   *      transform);
   *  (2) атрибуты ставятся императивно с cleanup: React не перепишет
   *      их, пока его собственные пропсы не меняются (inert у хедера
   *      React-управляемый только из состояния бургера).
   * Заодно гасится и cookie-баннер (живёт в layout ВНЕ main — фокус-лапа
   * модалки его иначе достигала бы поверх бэкдропа). Escape/фокус-трап/
   * возврат фокуса на открывашку — как было (K7-FIX двойной rAF). */
  useEffect(() => {
    if (activeIndex === null) return;
    const roots = [
      document.querySelector("main"),
      document.querySelector("header"),
      document.querySelector('[data-component="ea-cookie-banner"]'),
    ].filter((el): el is HTMLElement => el !== null);
    roots.forEach((el) => {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    });
    return () => {
      roots.forEach((el) => {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      });
    };
  }, [activeIndex]);

  const activeTile = activeIndex === null ? null : TILES[activeIndex];

  return (
    <section
      ref={sectionRef}
      id="events-video-carousel"
      aria-label="Видео мероприятий"
      className="ea-evt-video ea-section ea-section--cream"
    >
      <div className="ea-container ea-container--wide">
        {/* Header — eyebrow + H2 (italic-as-fragment) + subtitle.
            (Task 4-B: TiltedAccent «кухня» removed; wording updated.)
            C77 (владелец): здесь будет ~10 видео с мероприятий — и не
            только еда. Копия переписана под это: афоризм «Не только
            блюда. Всё событие.» + подзаголовок без счётчика (работает и
            на текущих роликах, и на будущих десяти), охватывает кухню,
            зал, команду и гостей. */}
        <motion.div
          className="ea-evt-video__top"
          initial={reduceSettled ? false : { opacity: 0, y: 24 }}
          whileInView={reduceSettled ? undefined : { opacity: 1, y: 0 }}
          /* c83-F2 (V1b RM): под reduce финал мгновенно через animate
             (duration 0) — снятие whileInView без animate оставляло
             SSR-стиль opacity:0 навсегда (шапка секции невидима под RM). */
          animate={reduceSettled ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-60px" }}
          transition={reduceSettled ? { duration: 0 } : { duration: 0.7, ease: EASE }}
        >
          <div className="ea-evt-video__heading-block">
            <span className="ea-eyebrow--script">Видео с наших мероприятий</span>
            <h2 className="ea-section-h2 ea-evt-video__h2">
              {"Не только блюда. "}
              <i className="ea-italic-fragment">Всё событие</i>
              {"."}
            </h2>
            <p className="ea-evt-video__subtitle">
              Живые кадры с наших мероприятий — кухня и подача, зал и свет,
              команда и гости в движении.
            </p>
          </div>
        </motion.div>

        {/* Horizontal carousel — pure CSS scroll-snap. */}
        <ul
          ref={scrollerRef}
          className="ea-evt-video__scroller"
          aria-label="Видео мероприятий — горизонтальная прокрутка"
          aria-roledescription="carousel"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          tabIndex={0}
        >
          {TILES.map((tile, i) => (
            <li
              key={`${tile.video}-${i}`}
              className="ea-evt-video__card group"
              role="group"
              aria-roledescription="slide"
              aria-label={`Видео ${i + 1} из ${TILES.length}: ${tile.title}`}
              onMouseEnter={() => playHoverVideo(i)}
              onMouseLeave={() => pauseHoverVideo(i)}
              /* C78: 3D-tilt к курсору + глянец-блик (MicroDelights;
                  у <li> своего transform нет — hover-масштаб живёт на
                  __video-потомке, конфликт исключён; fine-pointer only). */
              data-tilt
            >
              {/* Poster image — the visual base of the tile (alt text carries
                  the content description for AT).
                  FIX-4 [F3, W1-D]: было сырой <img loading="eager"> — 4
                  постера качались сразу (~640КБ, карусель ниже фолда) +
                  React 19 SSR автоэмитил <link rel=preload as=image> для
                  каждого eager-<img>. Теперь next/image (fill + lazy по
                  умолчанию): постеры оптимизируются в webp и грузятся
                  только при заходе карусели во вьюпорт. */}
              <ClipPathReveal
                direction="alternate"
                index={i}
                duration={0.8}
                className="absolute inset-0"
              >
                <Image
                  className="ea-evt-video__video"
                  src={tile.poster}
                  alt={tile.videoAlt}
                  fill
                  sizes="(max-width: 767px) 280px, 320px"
                />
              </ClipPathReveal>

              {/* W4-FIX hover-тизер: <video> ALWAYS in the DOM above the
                  poster (same .ea-evt-video__video class → same absolute
                  fill + hover scale). preload="none" + без poster-атрибута
                  (FIX-4: poster-атрибут браузер качает сразу при вставке
                  элемента, даже с preload="none" — это держало ~640КБ
                  сырых постеров в начальной загрузке; визуальную базу
                  плитки несёт next/image ниже, видео прозрачно до
                  первого play) — браузер не запрашивает НИЧЕГО до
                  первого hover-play. Plays only on hover (fine pointer,
                  section in view, one at a time) — see playHoverVideo
                  above. Decorative: aria-hidden, the img alt carries the
                  description. */}
              <video
                ref={(el) => {
                  hoverVideosRef.current[i] = el;
                }}
                className="ea-evt-video__video"
                src={tile.video}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                tabIndex={-1}
              />

              {/* Bottom gradient overlay — rgba(0,0,0,0.78) → transparent. */}
              <div className="ea-evt-video__overlay" aria-hidden="true" />

              {/* Center play-pill CTA — ggcatering signature.
                  c83-B (Impl-B): внутренний слой .ea-evt-video__play-sheen —
                  клип-обёртка shimmer-sweep (блик проезжает при hover).
                  Бордер/фон/тень остаются на внешней кнопке — грабля
                  «клип режет тень» (§2/c66); слой растянут на весь
                  интерьер пила (margin −padding — контент неподвижен). */}
              <button
                type="button"
                className="ea-evt-video__play"
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights). */
                data-press
                onClick={(e) => openModal(i, e.currentTarget)}
                /* 81-W2F1 (критик G MAJOR, WCAG 2.5.3 Label in Name):
                   aria-label начинается с ВИДИМОГО текста «Смотреть видео»
                   (было «Открыть видео: …» — не совпадало с надписью). */
                aria-label={`Смотреть видео: ${tile.title}`}
              >
                <span className="ea-evt-video__play-sheen">
                  <svg
                    viewBox="0 0 24 24"
                    className="ea-evt-video__play-icon"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Смотреть видео</span>
                </span>
              </button>

              {/* Bottom caption panel. */}
              <div className="ea-evt-video__caption">
                <span className="ea-evt-video__category">
                  {tile.category}
                </span>
                <h3 className="ea-evt-video__title">{tile.title}</h3>
                <p className="ea-evt-video__meta">{tile.meta}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Custom 2px × 100% red progress indicator (JS-driven width). */}
        <div className="ea-evt-video__progress-track" aria-hidden="true">
          <div
            className="ea-evt-video__progress-bar"
            style={{
              width: `${Math.max(0.08, Math.min(1, progress)) * 100}%`,
            }}
          />
        </div>

        {/* Cycle 39 fix: desktop prev/next arrows — the 4th card was
            partially cut with no affordance. Arrows scroll one card.
            81-F2: на краю трека стрелка гаснет (opacity 40% +
            pointer-events: none — CSS-правило [data-edge="true"];
            критик B: стрелка «дальше» при упоре в конец читалась как
            сломанная — это кламп трека, не баг скролла). */}
        <div className="ea-evt-video__nav">
          <button
            type="button"
            className="ea-evt-video__nav-btn"
            data-edge={atStart ? "true" : undefined}
            aria-disabled={atStart || undefined}
            /* C79: тач-нажатие — WAAPI-пружина (MicroDelights). */
            data-press
            onClick={() => {
              if (atStart) return;
              goTo(-1);
            }}
            aria-label="Предыдущее видео"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="ea-evt-video__nav-btn"
            data-edge={atEnd ? "true" : undefined}
            aria-disabled={atEnd || undefined}
            /* C79: тач-нажатие — WAAPI-пружина (MicroDelights). */
            data-press
            onClick={() => {
              if (atEnd) return;
              goTo(1);
            }}
            aria-label="Следующее видео"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fullscreen modal — full video unmuted + native controls + close.
          81-F2: createPortal(document.body) — фон (main/header/cookie)
          гасится inert'ом (см. эффект выше), а сама модалка обязана жить
          ВНЕ погашенного поддерева; fixed-инсет от портала не зависит от
          предков (ни у кого из них нет transform — иначе fixed прилипал бы
          к секции). */}
      {activeTile &&
        createPortal(
          <div
            className="ea-evt-video__modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Видео: ${activeTile.title}`}
            onClick={closeModal}
            onKeyDown={trapFocus}
          >
            <button
              ref={closeRef}
              type="button"
              className="ea-evt-video__close"
              /* C79: тач-нажатие — WAAPI-пружина (MicroDelights). */
              data-press
              onClick={closeModal}
              aria-label="Закрыть видео"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
            <div
              ref={videoWrapRef}
              className="ea-evt-video__modal-frame"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 81-W2F1: обёртка видео — трек для Play-оверлея (центр
                  кадра, НЕ поверх нативных controls внизу). */}
              <div className="ea-evt-video__modal-video-wrap">
                <video
                  ref={modalVideoRef}
                  className="ea-evt-video__modal-video"
                  src={activeTile.video}
                  poster={activeTile.poster}
                  autoPlay
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={activeTile.videoAlt}
                  onPlay={() => setModalPlayed(true)}
                />
                {!modalPlayed && (
                  <button
                    type="button"
                    className="ea-evt-video__modal-play"
                    onClick={() => {
                      modalVideoRef.current
                        ?.play()
                        .then(() => setModalPlayed(true))
                        .catch(() => {
                          /* отказ браузера — нативные controls остаются,
                             оверлей не снимаем (видео всё ещё на паузе) */
                        });
                    }}
                    aria-label="Смотреть видео"
                  >
                    <Play className="ea-evt-video__modal-play-icon" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="ea-evt-video__modal-caption">
                <span className="ea-evt-video__category">
                  {activeTile.category}
                </span>
                <h3 className="ea-evt-video__modal-title">{activeTile.title}</h3>
                <p className="ea-evt-video__meta">{activeTile.meta}</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

export default EventsVideoCarousel;

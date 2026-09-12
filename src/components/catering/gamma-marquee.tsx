"use client";

import * as React from "react";
import Image from "next/image";
import { useMounted } from "@/hooks/use-mounted";

/**
 * GammaMarquee — Cycle 31 NEW. gammacatering.com signature infinite
 * horizontal photo marquee — the "photo scroll effect" the user
 * explicitly called out as a must-have.
 *
 * Source: docs/advanced-technical/site_21_gamma.html §4567-4603
 *   .marquee-slider > .marquee-track > .marquee-item[] (у gamma — 14
 *   портретных food/event фото). Gamma uses Splide (loop + AutoScroll +
 *   free drag) — we reproduce the same VISUAL result with a pure CSS
 *   keyframes loop (`@keyframes gamma-marquee-scroll` in globals.css:
 *   translate3d 0 → -50%, 170s linear infinite — the same -50% seam trick
 *   gamma uses for their TEXT marquee in §4611-4619). Children rendered
 *   TWICE for the seamless -50% loop — when the first set has fully
 *   scrolled out of view, the duplicate set is in the exact position the
 *   first started, so the animation loops without a visible jump.
 *
 * CYCLE 88 — контент ленты: 44 РЕАЛЬНЫХ фото владельца (Яндекс.Диск,
 * папка «Итоговые фото… на главную страницу»; конвейер c87: webp q82,
 * честные alt только по видимому, лого-кропы волн критиков) вместо 14
 * стоковых gamma-кадров — по указанию владельца «наши фотки» именно в
 * эту ленту (сразу за «Кейтеринг как искусство»). «Правда фото» (урок
 * c60): кадр НЕ режем под форму — тайлы единой ВЫСОТЫ (373px мобайл /
 * 400px md+), ширина тайла = высота × пропорция кадра (портрет 3/4 ·
 * квадрат 1/1 · альбом 4/3 · панорама 16/9) — редакционный ритм
 * смешанных ширин журнальной ленты; верх/низ ленты выровнены
 * пиксель-в-пиксель (то же требование VLM-critique #1).
 *
 * ANIMATION PIPELINE (Cycle 41 PERF FIX + Task 5-C; GSAP удалён —
 * stale-докблок пойман аудитом c83-2, фикс c83-D):
 *   1. Loop — CSS keyframes `.gamma-marquee__track--anim` (transform-only
 *      → композитор; прежний GSAP-твин писал inline transform каждый кадр
 *      из JS и вместе с grain-репейнтом валил main thread в фризы).
 *   2. Drag (Cycle 31.1) — pointer-обработчики ставят animation:none и
 *      ведут track инлайн-transform'ом; на release кейфреймы
 *      перезапускаются с отрицательным animation-delay (-resumeAt) —
 *      бесшовно с места броска.
 *   3. Scroll-velocity (Task 5-C) — Web Animations API: playbackRate
 *      (0.6…2.2) на существующей CSSAnimation (track.getAnimations()),
 *      rate никогда не возвращает анимацию в main thread.
 *
 * Photos (c88): 44 реальных кадра из /media/c87/ — та же подборка, что
 * прошла три волны слепых критиков в c87 (порядок, подписи, кропы
 * чужих логотипов). Файлы: real-event-01..44.webp, исходники 614–1956px
 * по ширине. Тайл: единая высота + aspect-ratio самого кадра
 * (object-cover при совпадающей пропорции источника = кропа нет), 32px
 * (mr-8) правый отступ — редакционное дыхание. Дюрация цикла 40с → 170с:
 * сет из 44 смешанных кадров ≈ 19.5к px против 4.6к у 14 портретов —
 * 170с держит прежнюю скорость ленты ~110–115 px/s (двелл кадра ~3.9с
 * против ~2.9с у стока).
 * (c83: НЕ писать утилити-подобные токены «aspect + [N:N]» в комментариях —
 * Tailwind v4 сканирует комментарии как кандидаты классов и генерит
 * невалидный aspect-ratio N:N, от которого падает next build.)
 *
 * Section: full-bleed (NO horizontal padding), `overflow: hidden`,
 * `bg-cream` — sits in the natural page flow, default z-index. Edge-fade
 * mask REMOVED (Cycle 31.1, по прямому запросу владельца «убери плавное
 * затухание») — фото входят/выходят с чёткими краями (см. JSX-комментарий
 * секции ниже). Pure photo
 * scroll: NO text overlay, NO eyebrow — per gamma's lead, the marquee is
 * just photos. A 1px hairline top + bottom border in
 * `color-mix(in oklch, var(--ink) 8%, transparent)` frames the band as a
 * filmstrip so the marquee reads as a deliberate band instead of a strip
 * with a harsh bottom cut (VLM critique fix).
 *
 * Height: ~440px on md+ (photos 400px + 20px vertical padding top/bottom
 * via `py-5`; +2px for the two 1px hairlines). Photos fit within the
 * section so there is no harsh cut.
 *
 * Reduced-motion: if the user prefers reduced motion, the keyframes
 * animation is NOT created (класс --anim не вешается) and the track falls
 * back to a native horizontal
 * `overflow-x-auto` scroll with `scroll-snap-x mandatory` so users can
 * still browse the photos by scrolling, just without auto-motion. This
 * matches the gamma site's reduced-motion behaviour (Splide AutoScroll
 * disabled under prefers-reduced-motion).
 *
 * Mount gate: `useMounted()` returns false during SSR + first client
 * render, true after mount. Until mounted, we render a STATIC track
 * (the duplicate-set markup, БЕЗ анимации), so the server and client
 * agree on initial HTML and there is no hydration mismatch. After mount,
 * эффект добавляет треку класс `.gamma-marquee__track--anim` —
 * CSS-кейфреймы берут transform (тот же SSR-гейт-паттерн, что
 * рекомендует `use-mounted.ts` §14 грабли #8).
 *
 * First wow photo moment after the hero: в page.tsx лента идёт за
 * GgVideoShowcase (hero → header → video → marquee), mirroring gamma's
 * structure (hero → marquee → content).
 *
 * @see /home/z/my-project/newsite/docs/advanced-technical/site_21_gamma.html
 *      §4567-4603 (image marquee), §4611-4619 (text marquee — -50% seam)
 */

/** Пропорция кадра (классификация c87 по нативным пропорциям файлов):
 *  p — портрет 3/4, s — квадрат 1/1, l — альбом 4/3, xl — панорама 16/9. */
type MarqueeRatio = "p" | "s" | "l" | "xl";

/** Пропорция как CSS-строка для инлайн aspect-ratio тайла. */
const RATIO_CSS: Record<MarqueeRatio, string> = {
  p: "3 / 4",
  s: "1 / 1",
  l: "4 / 3",
  xl: "16 / 9",
};

/** sizes-подсказка next/image — точная ширина слота по пропорции кадра
 *  (высота тайла 373px мобайл / 400px md+, умноженная на пропорцию).
 *  Retina просит слот×2 и капается шириной исходника. */
const SIZES: Record<MarqueeRatio, string> = {
  /* c88-F2 (критик волны-1): граница 767, а не 768 — Tailwind md:
     срабатывает УЖЕ на 768px, и при vw=768 (iPad portrait) мобильная
     подсказка врала на ~7% при десктопном слоте. */
  p: "(max-width: 767px) 280px, 300px",
  s: "(max-width: 767px) 373px, 400px",
  l: "(max-width: 767px) 497px, 533px",
  xl: "(max-width: 767px) 663px, 711px",
};

/** 44 реальных фото событий (c88; конвейер и alt — c87, три волны слепых
 *  критиков): /media/c87/real-event-01..44.webp. Порядок — финальная
 *  редакционная раскладка c87 (ритм «сцена↔еда», сильные открытие и
 *  финал). alt описывает только видимое на кадре — без выдуманных
 *  площадок и числа гостей. */
const MARQUEE_PHOTOS: ReadonlyArray<{
  src: string;
  ratio: MarqueeRatio;
  alt: string;
}> = [
  { src: "/media/c87/real-event-01.webp", ratio: "p", alt: "Длинный банкетный стол в светлом зале с сервировкой на каждого гостя" },
  { src: "/media/c87/real-event-02.webp", ratio: "l", alt: "Индивидуальная порционная сервировка из трёх блюд на белом столе" },
  { src: "/media/c87/real-event-03.webp", ratio: "p", alt: "Двухъярусный ресторанный зал с цветочным декором и люстрами" },
  { src: "/media/c87/real-event-04.webp", ratio: "p", alt: "Фуршетный стол крупным планом — закуски и морепродукты" },
  { src: "/media/c87/real-event-05.webp", ratio: "l", alt: "Банкетный зал с жёлтыми креслами и панорамными окнами" },
  { src: "/media/c87/real-event-06.webp", ratio: "p", alt: "Брускетты с лососем и сыром на деревянной доске" },
  { src: "/media/c87/real-event-07.webp", ratio: "p", alt: "Просторный зал с высоким потолком и длинным банкетным столом" },
  { src: "/media/c87/real-event-08.webp", ratio: "s", alt: "Канапе с красной икрой на шпажках крупным планом" },
  { src: "/media/c87/real-event-09.webp", ratio: "xl", alt: "Широкая панорама фуршетного стола с закусками и высокими столиками" },
  { src: "/media/c87/real-event-10.webp", ratio: "p", alt: "Сервированный банкетный стол с блюдами в светлом зале" },
  { src: "/media/c87/real-event-11.webp", ratio: "l", alt: "Фуршетный стол в автосалоне вокруг красного автомобиля, за окнами парковка" },
  { src: "/media/c87/real-event-12.webp", ratio: "s", alt: "Десерты на шпажках с ягодами крупным планом" },
  { src: "/media/c87/real-event-13.webp", ratio: "p", alt: "Длинный банкетный стол под белым шатром с белыми стульями" },
  { src: "/media/c87/real-event-14.webp", ratio: "l", alt: "Банкетный стол с белой скатертью и закусками на золотистых подставках" },
  { src: "/media/c87/real-event-15.webp", ratio: "p", alt: "Интерьер судна с панорамными окнами и прозрачной крышей, за окнами река и набережная" },
  { src: "/media/c87/real-event-16.webp", ratio: "s", alt: "Канапе с лососем на шпажках крупным планом" },
  { src: "/media/c87/real-event-17.webp", ratio: "l", alt: "Банкет на террасе с видом на воду, столы с чёрными скатертями" },
  { src: "/media/c87/real-event-18.webp", ratio: "p", alt: "Длинный банкетный стол с цветочными композициями и свечами" },
  { src: "/media/c87/real-event-19.webp", ratio: "s", alt: "Прозрачные стаканчики с мясными салатами крупным планом" },
  { src: "/media/c87/real-event-20.webp", ratio: "xl", alt: "Длинный стол с едой и мармитами у кирпичной стены, официанты на линии" },
  { src: "/media/c87/real-event-21.webp", ratio: "p", alt: "Длинный банкетный стол с закусками, посудой и бокалами в светлом салоне" },
  { src: "/media/c87/real-event-22.webp", ratio: "p", alt: "Чёрно-белое фото тарталеток на подносе" },
  { src: "/media/c87/real-event-23.webp", ratio: "l", alt: "Круглый банкетный стол у окна с белой скатертью" },
  { src: "/media/c87/real-event-24.webp", ratio: "s", alt: "Канапе с ветчиной и сыром на шпажках крупным планом" },
  { src: "/media/c87/real-event-25.webp", ratio: "l", alt: "Накрытый банкетный стол с белой скатертью, золотистыми тарелками и бокалами" },
  { src: "/media/c87/real-event-26.webp", ratio: "p", alt: "Официант у стола с десертами в богато украшенном зале" },
  { src: "/media/c87/real-event-27.webp", ratio: "s", alt: "Канапе с рыбой на шпажках крупным планом" },
  { src: "/media/c87/real-event-28.webp", ratio: "l", alt: "Белые шатры на открытом воздухе — художественная чёрно-белая фотография" },
  { src: "/media/c87/real-event-29.webp", ratio: "l", alt: "Банкетный стол с зелёной скатертью и сервировкой" },
  { src: "/media/c87/real-event-30.webp", ratio: "p", alt: "Круглый стол с золотистыми тарелками и цветами" },
  { src: "/media/c87/real-event-31.webp", ratio: "s", alt: "Канапе с ветчиной и огурцами на шпажках крупным планом" },
  { src: "/media/c87/real-event-32.webp", ratio: "p", alt: "Длинный стол с закусками, десертами и цветами" },
  { src: "/media/c87/real-event-33.webp", ratio: "p", alt: "Длинный банкетный стол с обильной цветочной композицией по центру" },
  { src: "/media/c87/real-event-34.webp", ratio: "l", alt: "Чёрный фуршетный стол с бокалами, цветами и бутылками в стиле лофт" },
  { src: "/media/c87/real-event-35.webp", ratio: "p", alt: "Фуршетный стол с канапе и цветами" },
  { src: "/media/c87/real-event-36.webp", ratio: "p", alt: "Стол с цветочными композициями в стеклянных вазах" },
  { src: "/media/c87/real-event-37.webp", ratio: "l", alt: "Площадка под тентом с высокими столиками для мероприятия" },
  { src: "/media/c87/real-event-38.webp", ratio: "p", alt: "Длинный фуршетный стол с закусками и цветами" },
  { src: "/media/c87/real-event-39.webp", ratio: "p", alt: "Терраса с гирляндами и длинными столами в белых скатертях, вид сверху" },
  { src: "/media/c87/real-event-40.webp", ratio: "xl", alt: "Длинные банкетные столы с красными скатертями, блюдами и напитками" },
  { src: "/media/c87/real-event-41.webp", ratio: "p", alt: "Вечернее мероприятие — гости у фуршетных столов в полутёмном зале" },
  { src: "/media/c87/real-event-42.webp", ratio: "p", alt: "Фуршетный стол с закусками и цветами" },
  { src: "/media/c87/real-event-43.webp", ratio: "p", alt: "Длинный фуршетный стол с подсветкой и декором" },
  { src: "/media/c87/real-event-44.webp", ratio: "xl", alt: "Накрытый круглый стол с посудой и зелёной подсветкой — вечерний кадр" },
];

/** Photo tile — единая ВЫСОТА (373px мобайл / 400px md+), ширина
 *  выводится из aspect-ratio САМОГО КАДРА (инлайн-стиль — пропорция у
 *  каждого фото своя: портрет, квадрат, альбом, панорама). «Правда
 *  фото» (c60/c88): кадр не режем под форму — форму подстраиваем под
 *  кадр; object-cover при совпадающей пропорции источника = кропа нет,
 *  а верх и низ ленты выровнены пиксель-в-пиксель (то же требование,
 *  что закрывал VLM-critique #1 про рваные края). Тайл-обёртка (не
 *  картинка) владеет боксом — fill + object-cover.
 *
 *  sizes — точная ширина слота по пропорции кадра; retina просит
 *  слот×2 и капается исходником (замер c88: 41 из 44 источников
 *  покрывают full-retina; перекропанные в c87 кадры 20, 25 и 44
 *  отдают ~0.7–0.85× на retina-десктопе — те же файлы критики c87
 *  уже одобрили при ещё более крупной карточке, апскейл на
 *  движущейся ленте неразличим).
 *
 *  Rendered twice per set (see `<PhotoSet />`) for the seamless -50%
 *  loop. mr-8 (32px) right margin for editorial breathing room —
 *  critique #2 asked for less cramped spacing. */
function PhotoTile({
  src,
  alt,
  ratio,
  /** Marks the duplicate clone as decorative for screen readers so the
   *  photo list is not announced twice. */
  ariaHidden = false,
}: {
  src: string;
  alt: string;
  ratio: MarqueeRatio;
  ariaHidden?: boolean;
}): React.ReactElement {
  return (
    <span
      className="gamma-marquee__item relative mr-8 inline-block h-[373px] shrink-0 snap-start overflow-hidden md:h-[400px]"
      style={{ aspectRatio: RATIO_CSS[ratio] }}
      aria-hidden={ariaHidden || undefined}
      /* C78: двойной тап по фото — золотой всплеск искр (MicroDelights). */
      data-spark
    >
      <Image
        src={src}
        alt={ariaHidden ? "" : alt}
        fill
        /* c88: слот = высота 373/400 × пропорция кадра (см. SIZES выше);
           исходники c87 614–1956px — большинство покрывает retina-запрос
           слот×2, оптимизатор капает до ширины исходника (детали и
           история замеров — в докблоке PhotoTile). */
        sizes={SIZES[ratio]}
        className="gamma-marquee__img absolute inset-0 h-full w-full object-cover"
        // FIX-4 [F3, W1-D]: было loading="eager" — React 19 SSR
        // автоэмитит preload-линк для каждого img без loading="lazy" —
        // marquee-фото ниже фолда уходили в head как preload-и. Оставляем
        // дефолт next/image (lazy): preload-линки не плодятся, фото
        // грузятся по мере захода в вьюпорт — горизонтальный скролл ленты
        // подводит их в зону IO сам (88 тайлов — особенно важно).
        // draggable=false so the user can't accidentally trigger the
        // browser's native image-drag gesture over the marquee (which
        // would otherwise interfere with the keyframes-driven motion).
        draggable={false}
      />
    </span>
  );
}

/** One full set of 44 photos — rendered TWICE inside the track so the CSS
 *  keyframes loop translate3d(-50%) is seamless (when set 1 has fully
 *  exited left, set 2 is exactly where set 1 started). Ширины тайлов
 *  детерминированы (явная высота + aspect-ratio — не зависят от загрузки
 *  картинок), поэтому шов -50% не плывёт при lazy-загрузке. */
function PhotoSet({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <span className="gamma-marquee__set flex shrink-0 items-center">
      {MARQUEE_PHOTOS.map((photo, i) => (
        <PhotoTile
          key={`${photo.src}-${i}`}
          src={photo.src}
          alt={photo.alt}
          ratio={photo.ratio}
          ariaHidden={ariaHidden}
        />
      ))}
    </span>
  );
}

export function GammaMarquee() {
  const mounted = useMounted();
  const trackRef = React.useRef<HTMLDivElement>(null);
  const sectionRef = React.useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // ── Marquee timing ──────────────────────────────────────────────────
  /** One full loop (0 → -50% of the track) in seconds. Must match the
   * CSS keyframes duration. c88: 170с — сет из 44 кадров ≈ 19.5к px
   * (против 4.6к у 14 сток-портретов): скорость ленты осталась
   * ~110–115 px/s, как была при 40с. */
  const MARQUEE_DURATION_S = 170;

  // ── Drag state ──────────────────────────────────────────────────────
  // Cycle 31.1: the user requested the marquee be draggable by cursor
  // (like gammacatering.com, which uses Splide `drag: 'free'`). We
  // implement manual pointer drag on top of the CSS-keyframes auto-scroll:
  //   - pointerdown  → freeze the keyframes (animation:none), record
  //                    startX + current baseX (computed matrix)
  //   - pointermove  → set track x = baseX + (clientX - startX)
  //   - pointerup    → normalize x into the [-trackWidth/2, 0] loop range,
  //                    then resume the keyframes from there via a
  //                    matching negative animation-delay.
  // During drag the track's x is an inline transform (keyframes paused).
  // cursor: grab/grabbing + touch-action: pan-y (inline style)
  // so touch devices don't fight vertical scroll while we own the
  // horizontal gesture.
  const dragState = React.useRef({
    active: false,
    startX: 0,
    baseX: 0, // track x at pointerdown (in px)
    trackWidth: 0, // one full set width (half of scrollWidth due to clone)
  });

  const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current || reducedMotion) return;
    // Only respond to primary pointer (left mouse / touch / pen).
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const track = trackRef.current;
    dragState.current.active = true;
    dragState.current.startX = e.clientX;
    // Freeze the CSS animation at its current offset: read the computed
    // transform (the running keyframes apply it), then swap to a static
    // inline transform so pointermove math has a stable base.
    const cs = getComputedStyle(track);
    const matrix = cs.transform;
    let currentX = 0;
    if (matrix && matrix !== "none") {
      const match = matrix.match(/matrix.*\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => parseFloat(v.trim()));
        currentX = values.length === 16 ? values[12] : values[4] || 0;
      }
    }
    dragState.current.baseX = currentX;
    // One set = half of the track's scrollWidth (two duplicate sets).
    dragState.current.trackWidth = track.scrollWidth / 2;
    // Stop the keyframes animation (inline transform takes over).
    track.style.animation = "none";
    track.style.transform = `translate3d(${currentX}px, 0px, 0px)`;
    // Capture pointer so move events keep firing even if cursor leaves
    // the track bounds during drag.
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
    if (sectionRef.current) {
      sectionRef.current.dataset.dragging = "true";
    }
  }, [reducedMotion]);

  const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !trackRef.current) return;
    const delta = e.clientX - dragState.current.startX;
    let newX = dragState.current.baseX + delta;
    // Normalize into the [-trackWidth, 0] range so dragging past either
    // edge wraps to the other side (seamless infinite drag).
    const w = dragState.current.trackWidth;
    if (w > 0) {
      while (newX > 0) newX -= w;
      while (newX < -w) newX += w;
    }
    trackRef.current.style.transform = `translate3d(${newX}px, 0px, 0px)`;
  }, []);

  const onPointerUp = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !trackRef.current) return;
    dragState.current.active = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
    if (sectionRef.current) {
      delete sectionRef.current.dataset.dragging;
    }
    // Resume the CSS keyframes from wherever the user dropped the track.
    // The keyframes run 0 → -50% (one set width, w px) over 170s. A track
    // at position X (in [-w, 0]) corresponds to animation progress
    // t = -X / w of the cycle — resume with a matching negative delay.
    const track = trackRef.current;
    const w = dragState.current.trackWidth;
    const cs = getComputedStyle(track);
    const matrix = cs.transform;
    let currentX = 0;
    if (matrix && matrix !== "none") {
      const match = matrix.match(/matrix.*\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(",").map((v) => parseFloat(v.trim()));
        currentX = values.length === 16 ? values[12] : values[4] || 0;
      }
    }
    if (w > 0) {
      while (currentX > 0) currentX -= w;
      while (currentX < -w) currentX += w;
    }
    const progress = w > 0 ? -currentX / w : 0; // 0..1
    const resumeAt = progress * MARQUEE_DURATION_S;
    /* c88-F1 (критик волны-1, покадровый замер): прежний порядок —
       transform="" сразу после pointerup — ставил трек в x=0 на ~2 кадра
       до перезапуска кейфреймов (вспышка ленты в начало координат).
       Фикс: замороженный инлайн-transform живёт, пока кейфреймы снова
       не завладеют трансформом — сначала возвращаем анимацию с
       отрицательной задержкой, и лишь потом снимаем инлайн-transform
       (CSS-анимация в каскаде сильнее инлайн-стиля — ни в одном кадре
       скачка не видно). */
    track.style.animation = "none";
    // Force a style flush so the animation restarts from scratch with
    // the negative delay (double rAF is the standard trick).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.animation = "";
        track.style.animationDelay = `${-resumeAt}s`;
        track.style.transform = "";
      });
    });
  }, []);

  // Read prefers-reduced-motion AFTER mount (server has no window) so we
  // don't risk a hydration mismatch. The animation effect below reads
  // this state and skips the CSS keyframes loop when true.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    // addEventListener is the modern API; addListener is the legacy
    // Safari < 14 fallback — both are guarded so we don't crash on old
    // browsers. The fallback is one line and keeps the marquee
    // accessible to users on older macOS / iOS.
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else if (typeof (mq as MediaQueryList).addListener === "function") {
      (mq as MediaQueryList).addListener(onChange);
    }
    return () => {
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", onChange);
      } else if (typeof (mq as MediaQueryList).removeListener === "function") {
        (mq as MediaQueryList).removeListener(onChange);
      }
    };
  }, []);

  // Cycle 41 PERF FIX (critical): the infinite scroll is now a pure CSS
  // keyframes animation (`.gamma-marquee__track--anim`, transform-only →
  // compositor thread). Previously a GSAP tween updated the inline
  // transform every frame from JS — combined with the grain overlay's
  // repaint loop this contributed to full main-thread freezes on
  // software-rendered browsers. The drag interaction still works: pointer
  // handlers kill the keyframes with an INLINE `animation: none`
  // (c83-F1: никакого `.gamma-marquee__track--drag`-класса /
  // animation-play-state не существует) and translate the track inline;
  // on release the animation is dropped and restarted from a matched
  // offset via a negative animation-delay.
  React.useEffect(() => {
    if (!mounted || reducedMotion || !trackRef.current) return;
    const track = trackRef.current;
    track.classList.add("gamma-marquee__track--anim");
    return () => {
      track.classList.remove("gamma-marquee__track--anim");
      // c83-F5b (критик волна-3, LOW): drag-обработчики оставляют на треке
      // inline `animation: none` (pointerdown) и `animationDelay`
      // (release-resume). Если RM флипается true→false СРАЗУ после драга,
      // класс --anim вернётся, а выживший inline `animation: none` задушит
      // кейфреймы — лента замрёт. Сбрасываем оба, вместе с transform.
      track.style.animation = "";
      track.style.animationDelay = "";
      gsapSetTransformIdentity(track);
    };
  }, [mounted, reducedMotion]);

  // ── Task 5-C: scroll-velocity timeScale ──────────────────────────────
  // The band reacts to scroll speed: fast scrolling accelerates the loop
  // (playbackRate up to 2.2), scrolling up relaxes it (down to 0.6), and
  // at rest it eases back to exactly 1. Implemented on the EXISTING
  // compositor CSS keyframes via the Web Animations API — playbackRate
  // changes never drag the animation back onto the main thread (a GSAP
  // timeScale tween would reintroduce the Cycle 41 freeze).
  //
  // PERF (§43): слушатель scroll (passive) существует ТОЛЬКО пока секция в
  // зоне видимости ±20% (IntersectionObserver снимает его вне зоны);
  // внутри — ≤1 rAF на событие скролла. В покое — ноль слушателей, ноль rAF.
  //
  // c85-PERF (замер CPU-профиля: GammaMarquee.loop 1471ms self на прокрутку
  // страницы — 6.6% всего CPU): (1) track.getAnimations() вызывался КАЖДЫЙ
  // кадр лупа — аллокация+обход всех анимаций поддерева; теперь CSSAnimation
  // КЭШИРУЕТСЯ при первом apply и пере-резолвится только если кэш умер
  // (drag-режим ставит animation:none inline). (2) Луп + scroll-слушатель
  // живут ТОЛЬКО пока секция в кадре ±20% — вне экрана velocity-эффект
  // всё равно не виден; IO снимает всё хозяйство (паттерн SdZoomFallback).
  React.useEffect(() => {
    if (!mounted || reducedMotion) return;
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const MAX_RATE = 2.2;
    const MIN_RATE = 0.6;
    /** px/ms at which the rate saturates at MAX_RATE (≈ fast flick). */
    const SATURATION_V = 1.6;
    /** Signed velocity: scrolling down speeds the band up, up slows it. */
    const rateFor = (v: number) => {
      const target = 1 + v * ((MAX_RATE - 1) / SATURATION_V);
      return Math.max(MIN_RATE, Math.min(MAX_RATE, target));
    };

    let rafId = 0;
    let running = false;
    let lastY = window.scrollY;
    let lastT = 0;
    let vel = 0; // smoothed signed px/ms
    let rate = 1;
    let lastScrollAt = 0;
    /* c85: кэш CSSAnimation — getAnimations() ДОРОГОЙ (замер: 202ms на
       прокрутку при вызове каждый кадр). Живёт пока жива keyframes-анимация
       (class --anim не снимается; drag ставит animation:none inline —
       тогда кэш пуст и apply() молча no-op до конца drag). */
    let cachedAnim: CSSAnimation | null = null;

    const resolveAnim = (): CSSAnimation | null => {
      if (cachedAnim && cachedAnim.playState !== "finished") {
        // animation:none (drag) останавливает CSSAnimation → playState
        // отменён/finished; лёгкая проверка живости перед возвратом кэша.
        return cachedAnim;
      }
      const anims = track.getAnimations();
      for (const a of anims) {
        if ((a as CSSAnimation).animationName === "gamma-marquee-scroll") {
          cachedAnim = a as CSSAnimation;
          return cachedAnim;
        }
      }
      cachedAnim = null;
      return null;
    };

    const apply = () => {
      const a = resolveAnim();
      if (a) a.playbackRate = rate;
    };

    const loop = (now: number) => {
      const y = window.scrollY;
      if (lastT > 0) {
        const dt = Math.max(now - lastT, 1);
        const v = (y - lastY) / dt;
        vel = vel * 0.75 + v * 0.25;
      }
      lastY = y;
      lastT = now;
      // No fresh scroll events → decay toward rest.
      const idle = now - lastScrollAt > 180;
      if (idle) vel *= 0.88;
      rate += (rateFor(vel) - rate) * 0.08;
      if (idle && Math.abs(rate - 1) < 0.01) {
        rate = 1;
        apply();
        running = false;
        rafId = 0;
        return;
      }
      apply();
      rafId = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      lastScrollAt = performance.now();
      if (!running) {
        running = true;
        lastT = 0;
        rafId = requestAnimationFrame(loop);
      }
    };

    /* c85-PERF: всё хозяйство (scroll-слушатель + луп) монтируется ТОЛЬКО
       когда секция в кадре ±20% — вне экрана эффект невидим, слушателей
       ноль (грабля §52: анимация вне экрана бесплатно не бывает). */
    let listenersOn = false;
    const setListeners = (on: boolean) => {
      if (on === listenersOn) return;
      listenersOn = on;
      if (on) {
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", onScroll);
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        running = false;
        rate = 1;
        vel = 0;
        apply(); // вернуть естественную скорость на выходе из кадра
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        setListeners(entries.some((en) => en.isIntersecting));
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      setListeners(false);
      // Leave the animation at natural speed for whoever mounts next.
      const anims = track.getAnimations();
      for (const a of anims) {
        if ((a as CSSAnimation).animationName === "gamma-marquee-scroll") {
          a.playbackRate = 1;
        }
      }
    };
  }, [mounted, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      aria-label="Фотогалерея — кадры с наших мероприятий"
      className="gamma-marquee relative w-full overflow-hidden bg-cream py-5"
      style={{
        // Cycle 31.1: edge-fade mask REMOVED per user request: "убери
        // плавное затухание". The marquee now has crisp edges on both
        // sides — photos enter/exit hard, matching gamma's marquee
        // behaviour (gamma uses Splide overflow:hidden with no mask).
        // Filmstrip band framing kept — 1px hairline top + bottom in a
        // very low-opacity ink so the marquee reads as a deliberate band
        // rather than a floating strip.
        borderTop:
          "1px solid color-mix(in oklch, var(--ink) 8%, transparent)",
        borderBottom:
          "1px solid color-mix(in oklch, var(--ink) 8%, transparent)",
      }}
    >
      {/* Track: two identical PhotoSets side by side. The CSS keyframes
          loop drives the track to translate3d(-50%): set 1 has fully
          exited left and set 2 is exactly where set 1 started → the loop
          is seamless.

          Cycle 31.1: the track is now DRAGGABLE by cursor (pointer
          events). On drag, we pause the keyframes auto-scroll and take
          over with an inline transform; on release, we resume the
          auto-scroll from the dropped position. cursor: grab / grabbing
          signals the affordance. touch-action: pan-y keeps vertical page
          scroll native while we own the horizontal gesture.

          Under reduced-motion the track keeps the same markup, but no
          animation runs. Instead we let the wrapper scroll horizontally
          natively (overflow-x-auto + scroll-snap) so users can browse
          the photos by hand — the same end-result as gamma's Splide
          AutoScroll being disabled under reduced-motion. */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        /* C78: лейбл кастомного курсора над лентой — аффорданс «можно
            тянуть» (CustomCursor: [data-cursor] входит в INTERACTIVE). */
        data-cursor="Тяните"
        className={
          reducedMotion
            ? "gamma-marquee__track gamma-marquee__track--static flex w-max snap-x snap-mandatory overflow-x-auto pb-3"
            : "gamma-marquee__track gamma-marquee__track--draggable flex w-max cursor-grab select-none"
        }
        style={
          reducedMotion
            ? undefined
            : {
                // Prevent browser from interpreting horizontal drag as
                // swipe-back / scroll. Allow vertical pan for page scroll.
                touchAction: "pan-y",
              }
        }
      >
        <PhotoSet />
        {/* Set 2 — duplicate clone for seamless -50% loop. aria-hidden so
            screen readers don't announce the gallery twice. */}
        <PhotoSet ariaHidden />
      </div>
    </section>
  );
}

/**
 * Defensive identity-transform reset for the track element. Clears the
 * inline `transform` style directly (drag/release handlers may have left
 * a stale translate3d on it). Имя — реликвия GSAP-эпохи Cycle 31, оставлено
 * чтобы не менять код вызова (функция — только el.style.transform = "").
 * Keeps the cleanup branch SSR-safe (никаких внешних импортов).
 */
function gsapSetTransformIdentity(el: HTMLElement) {
  // Direct DOM reset is enough — no animation library is loaded here.
  el.style.transform = "";
}

export default GammaMarquee;

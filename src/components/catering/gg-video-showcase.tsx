"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMounted } from "@/hooks/use-mounted";
import { isLiteDevice } from "@/lib/lite-device";
import { useLiteDevice } from "@/hooks/use-lite-device";
import { GoldDust } from "@/components/motion/gold-dust";
import { useHapticFeedback } from "@/components/motion/tap-feedback";
/* c83-B (Impl-B, задача 1): Magnetic на Play-pill и kinetic-h2
   (scroll-driven wght) на H2. Гейты fine-pointer/reduce — внутри утилиты
   (c83-F1: до фикса утилита гейтила только reduce — тап на iOS эмулировал
   mousemove и дёргал pill пружиной; см. magnetic.tsx). */
import { Magnetic } from "@/components/motion/magnetic";
/* c83-B: kinetic-h2 — утилита c74-kinetic.css (animation-timeline: view(),
   entry 10% → cover 32%, wght 400→700; reduce/@supports-гейты внутри).
   Паттерн импорта — как ea-faq-accordion.tsx:7 (side-effect; Next
   дедуплицирует повторные импорты того же файла). */
import "@/components/motion/c74-kinetic.css";

/**
 * GgVideoShowcase — Cycle 31, Task 4-C.
 *
 * GGCATERING-STYLE VIDEO BLOCK — section #3 of the new 17-section site
 * structure (right after hero #1 + header #2, before photo carousel #4).
 *
 * Replicates ggcatering.com's signature "video-player" block: a full-bleed
 * ~720px-tall 16:9 section with a looping muted background video (W4-FIX:
 * the <video> is ALWAYS mounted with preload="none" — no bytes are fetched
 * until play() — and an IntersectionObserver starts the muted loop when the
 * section enters the viewport / pauses it when it leaves; the poster
 * attribute covers the pre-play frame), a dark double-gradient scrim, an
 * editorial overlay (Playfair H2 with EA signature italic-as-fragment
 * "искусство" in `--ea-red` + Russian subtitle + 2 CTA pills), and a
 * centered "Play"-pill button that toggles between two states:
 *
 *  - **default (teaser):** muted, no controls, looping b-roll.
 *  - **expanded:** unmuted, native controls visible, plays from current
 *    position. Re-click re-mutes + hides controls. (We don't have a separate
 *    full-video URL — per Task 4-C spec, just unmute + show controls on
 *    click. A simpler version of GGCatering's "teaser mp4 → Vimeo iframe
 *    swap".)
 *
 * Layout (matches GGCatering DOM):
 *   section.relative[data-header-theme=dark][aria-label]
 *   └─ div.aspect-video.relative
 *      ├─ video.absolute.inset-0.h-full.w-full.object-cover (контентное
 *      │   видео: свой aria-label, БЕЗ aria-hidden — см. Accessibility ниже)
 *      ├─ div.absolute.inset-0 double scrim (radial pool behind the text
 *      │   column + linear to-top base — Task 4-B readability hardening)
 *      ├─ div.absolute.inset-0.flex (overlay content — bottom-left aligned,
 *      │  padded — W1-FIX: tilted accent "видео" removed)
 *      │  ├─ h2 "Кейтеринг как <i>искусство</i>" (Playfair Display, white, italic fragment red)
 *      │  ├─ p subtitle (white/85, max-w-2xl)
 *      │  └─ div flex gap-4 — 2 CTA pills ("Смотреть меню" → #menu, "Рассчитать стоимость" → #calculator)
 *      └─ button.centered "Play" pill — toggles unmute + controls.
 *
 * Animation: framer-motion opacity 0→1 + y 24→0, viewport once:true,
 * margin "-80px", duration 0.7, ease [0.22,1,0.36,1]. Respects
 * `useReducedMotion` — when reduced, content renders statically on mount.
 *
 * `useMounted()` gates the animation branch to avoid SSR/CSR hydration
 * mismatch per AGENTS.md §14 грабли #8 (the reduce-motion query returns
 * false on server and possibly true on client).
 *
 * Accessibility: section has `aria-label`, the <video> carries its own
 * human-readable aria-label (sound + native controls → КОНТЕНТ, не
 * декорация — aria-hidden на нём НЕТ; c98-FIX2/критик4 #6: докблок прежде
 * заявлял «decorative video has aria-hidden» — аудитор по нему искал
 * несуществующую защиту). The play button has a descriptive `aria-pressed`
 * + aria-label that updates to reflect the current state, CTAs are real
 * anchor links with descriptive link text.
 *
 * @see docs/reference-library/ (ggcatering.com DOM capture, "video-player"
 *      section pattern)
 * @see src/components/catering/cep-simple-brilliant.tsx (sister component —
 *      also a video-bg + headline overlay, but full-section height + 0.5×
 *      slow-mo; this component uses 16:9 aspect-ratio instead and adds
 *      the editorial overlay + play-pill toggle)
 */

/** Editorial easing — Ridgewell/CEP/EA shared curve. */
const EASE = [0.22, 1, 0.36, 1] as const;

/* c84-A (задача 2, прямая просьба владельца): цикл слов второй строки H2.
   «кино» замыкает список на субтитл («мы создаём кино, которое можно
   попробовать»). Порядок фиксирован — SEO/SSR всегда видит первое слово. */
const ROTATE_WORDS = ["искусство", "ритуал", "спектакль", "кино"] as const;
/** Интервал смены слова, мс (WordRotate-паттерн ~2500-3000). */
const ROTATE_INTERVAL_MS = 2600;
/** Длительность exit/enter-флипа слова, с (mode="wait": полный цикл 2×). */
const MORPH_DURATION_S = 0.45;

/* ── c89 (3-d, Task 1 — владелец: «Видео которое сразу под херо вот это
   поставить»): клип владельца с Яндекс.Диска (hero.mov, снят на
   смартфон 1080×1920, 29.9с, СО ЗВУКОМ — диспенсеры с лимонадами +
   сервированный банкетный стол с розовой скатертью). Десктоп играет
   16:9 центр-кроп 1280×720; мобайл — вертикальная версия (c98-C, см.
   следующий блок); подмена источника — в mq-эффекте компонента
   (c98-FIX2, паттерн tott-hero.tsx). Постер — кадр из клипа. */
const SHOWCASE_VIDEO = "/media/c89/c89-showcase-720.mp4";
const SHOWCASE_POSTER = "/media/c89/c89-showcase-poster.webp";
/* ── c98-C (задача 1 — владелец: «На видео под херо на мобильной версии
   кнопка „смотреть" неровно, видео в горизонтальном формате. Может
   сделать это же видео в вертикальном и чтобы работали кнопки открыть
   во весь экран?»): вертикальная (9/16) версия ТОГО ЖЕ клипа c89,
   перекодированная оркестратором — 720×1280, h264 Main + звук AAC,
   ~29с. Заменяет мобильный портрет-кроп c89-showcase-portrait-720.mp4
   (480×720; файл остаётся в public/ по конвенции §28 — старое не
   удаляем, код больше не ссылается). Постер вертикальной версии
   подменяется на мобиле ВМЕСТЕ со src: атрибут poster один на все
   источники, а 16:9-постер в кадре 9/16 давал бы зум-кроп статичного
   кадра. Десктоп — без изменений (16:9 + SHOWCASE_POSTER). */
const SHOWCASE_VIDEO_VERTICAL = "/media/c98/c98-showcase-vertical.mp4";
const SHOWCASE_POSTER_VERTICAL =
  "/media/c98/c98-showcase-vertical-poster.webp";

/* c98-C (задача 1) / c98-FIX2 (критик4 MAJOR#1): мобильный детект =
   window.matchMedia("(max-width: 767px)") — ТОТ ЖЕ брейкпоинт, что у
   CSS-рамки md:aspect-video (Tailwind md = 768px). Прежняя формула
   (pointer:coarse ИЛИ innerWidth<768) расходилась с CSS: iPad 768×1024
   (coarse) и телефон-landscape (844×390) получали ВЕРТИКАЛЬНЫЙ файл в
   16:9-рамке — видимая центр-полоса ~32% кадра. coarse убран: тач-девайсы
   ≥768 живут по десктопным правилам (16:9 файл+рамка, inline-controls;
   фуллскрин — нативной кнопкой плеера). Пересечение границы 767↔768
   отслеживает mq-эффект в компоненте (подмена src/poster + isMobileView);
   здесь — живое чтение для фуллскрин-решения в togglePlay. */
const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;

/* c98-C (задача 1): вход в фуллскрин НА САМОМ <video> — НЕ на
   контейнере-обёртке (оверлей/H2/CTA/пилюля не должны показываться в
   полноэкранном кадре). Порядок вызова — ПОСЛЕ video.play() внутри того
   же клика (user activation): Android/Chrome — requestFullscreen на
   video → нативный фуллскрин-плеер с controls; iPhone —
   Element.requestFullscreen отсутствует, webkitEnterFullscreen
   поднимает нативный плеер (единственный путь на iOS; он сам стартует
   воспроизведение). Известный iOS-глюк «звук без картинки» возникает
   при входе в фуллскрин ДО старта play — порядок play → fullscreen его
   обходит. Тихие отказы: фуллскрин опционален, inline-controls
   остаются рабочими. */
const enterVideoFullscreen = (video: HTMLVideoElement) => {
  try {
    if (typeof video.requestFullscreen === "function") {
      void video.requestFullscreen().catch(() => {
        /* отказ (документ не разрешает / уже в фуллскрине) — не критично */
      });
      return;
    }
    /* TypeScript strict: webkitEnterFullscreen нет в lib.dom — каст. */
    const wk = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    };
    if (typeof wk.webkitEnterFullscreen === "function") {
      wk.webkitEnterFullscreen();
    }
  } catch {
    /* старые webkit кидают вместо промиса — глотаем */
  }
};

/* c98-C (задача 1): выход из фуллскрина (стандартный API + старый
   webkit-префикс). Страховка: системный выход юзера ловит
   fullscreenchange-эффект в компоненте. */
const exitFullscreenSafely = () => {
  try {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
    const wk = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => void;
    };
    if (
      wk.webkitFullscreenElement &&
      typeof wk.webkitExitFullscreen === "function"
    ) {
      wk.webkitExitFullscreen();
    }
  } catch {
    /* глотаем — стейт синхронизирует fullscreenchange-эффект */
  }
};

type Cta = {
  /** Visible label (Russian). */
  label: string;
  /** Anchor href — section id of the destination. */
  href: string;
};

const CTAS: Cta[] = [
  { label: "Смотреть меню", href: "#menu" },
  { label: "Рассчитать стоимость", href: "#calculator" },
];

export function GgVideoShowcase() {
  const mounted = useMounted();
  const reduce = useReducedMotion();
  const animate = mounted && !reduce;
  /* c84-A (задача 5): единый lite-детектор оркестратора (saveData || 2g ||
     deviceMemory ≤ 2 || cores ≤ 4, контракт src/lib/lite-device.ts).
     Гидро-паритет: SSR/первый рендер — false, даунгрейд после монта. */
  const lite = useLiteDevice();

  // Волна 1 / Task 1-c2: единый document-level тап-хаптик (вибрация 8ms
  // на тапах по button/a/[role=button]; iOS молча скипает — нет API).
  // Монтируется РОВНО ОДИН раз на страницу — здесь. Не дублировать.
  useHapticFeedback();

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  /* c98-FIX1 (критик1 #1, MAJOR): платформенный детект ДЛЯ РЕНДЕРА (aria-label
     ветвится — фуллскрин обещаем только там, где он реально есть). Дефолт
     false = десктоп-текст = SSR-HTML → гидро-паритет гарантирован; после
     маунта стейт уточняется ТЕМ ЖЕ isMobileViewport(), что решает
     фуллскрин в togglePlay. Детект стабилен между рендерами (не вызов в
     каждом рендере), смена текста после маунта — обычный React-апдейт
     а11y-атрибута (не mismatch).
     c98-FIX2 (критик4 MINOR#5): стейт ПОДПИСАН на change того же mq —
     стейл-детект после ресайза через 768 (лживый aria-label «на весь
     экран» в широком окне) закрыт; обновляет его mq-эффект ниже. */
  const [isMobileView, setIsMobileView] = useState(false);
  /* c98-FIX1 (критик1 #10): ref-зеркало expanded — togglePlay считает next
     из АКТУАЛЬНОГО значения, а не из стейл-замыкания рендера (два
     синхронных клика в одном тике = тоггл, а не двойной expand).
     Сайд-эффекты (play/fullscreen) остаются в хендлере клика — им нужен
     живой user-activation; чистый setExpanded(prev=>!prev) с мутациями
     видео в эффекте по [expanded] запускал бы их и на маунте (ломало бы
     lite-политику тизера) и отрывал от окна активации. Синхронизируем
     вручную во ВСЕХ местах setExpanded (togglePlay + onFsChange ниже). */
  const expandedRef = useRef(false);

  /* c98-FIX2 (критик4 MAJOR#1 + MINOR#5): единый mq-эффект мобильного
   * источника. matchMedia("(max-width: 767px)") — РОВНО брейкпоинт
   * Tailwind md:aspect-video (768px): JS-подмена src/poster и CSS-рамка
   * кадра больше не расходятся (прежде coarse||<768: iPad 768×1024 —
   * вертикальный файл в 16:9-рамке, полоса ~32% кадра; телефон-landscape
   * 844×390 — то же). Паттерн подмены — тот же, что c98-C: video.src
   * ПРЯМО на <video> (НЕ <source>.src) — установка src-атрибута
   * гарантированно перезапускает алгоритм загрузки, дочерний <source>
   * (16:9, SSR-разметка) игнорируется; ПОСТЕР — вместе со src (16:9-постер
   * в кадре 9/16 = зум-кроп статичного кадра). Поведение:
   *  - старт: начальный детект + стейт isMobileView (SSR-дефолт false);
   *  - пересечение 767↔768 (ресайз/поворот): src+poster обновляются
   *    СРАЗУ, если тизер на паузе; ИГРАЮЩЕЕ видео (paused=false,
   *    readyState≥2) или expanded (юзер смотрит со звуком) НЕ
   *    перезагружаем — src-swap перезапустил бы загрузку живого плеера
   *    (рывок + флеш постера); отложенная замена догоняет на ближайшей
   *    паузе (листенер 'pause' ниже: IO снимает секцию с кадра / юзер
   *    ставит паузу в нативных controls);
   *  - возврат ≥768: removeAttribute("src") + load() — алгоритм выбора
   *    источника снова берёт дочерний <source> 16:9, постер — 16:9.
   * Один эффект, аккуратный cleanup (mq-change + pause). */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const applySource = () => {
      /* гард «юзер смотрит»: играет с данными или expanded — источник
         не трогаем (замена догонит на паузе). */
      if (
        expandedRef.current ||
        (!video.paused && video.readyState >= 2)
      ) {
        return;
      }
      const mobile = mq.matches;
      const curSrc = video.getAttribute("src");
      if (mobile && curSrc !== SHOWCASE_VIDEO_VERTICAL) {
        video.src = SHOWCASE_VIDEO_VERTICAL;
        video.poster = SHOWCASE_POSTER_VERTICAL;
      } else if (!mobile && curSrc === SHOWCASE_VIDEO_VERTICAL) {
        /* назад к 16:9: снять src-атрибут + load() — выбор источника
           вернётся к <source>-ребёнку из SSR-разметки. */
        video.removeAttribute("src");
        video.load();
        video.poster = SHOWCASE_POSTER;
      }
    };
    applySource();
    setIsMobileView(mq.matches);
    const onMqChange = () => {
      setIsMobileView(mq.matches);
      applySource();
    };
    mq.addEventListener("change", onMqChange);
    video.addEventListener("pause", applySource);
    return () => {
      mq.removeEventListener("change", onMqChange);
      video.removeEventListener("pause", applySource);
    };
  }, []);

  /* c84-A (задача 2): индекс текущего слова морфинга. SSR/до монта — 0
     («искусство»), меняется ТОЛЬКО интервалом ниже (клиент). */
  const [wordIndex, setWordIndex] = useState(0);
  /* c84-A (задача 2): секция в вьюпорте? Отдельный маленький IO — пауза
     таймера морфинга вне кадра (грабля §52: анимация вне экрана —
     бесплатно не бывает). Начальное false — до первого колбэка IO. */
  const [sectionInView, setSectionInView] = useState(false);

  /** W4-FIX: React doesn't serialize the `muted` attribute into SSR HTML
   *  (known #10389) — pin the DOM property on mount so the muted autoplay
   *  below is never rejected. togglePlay owns `muted` afterwards. */
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = true;
  }, []);

  /* c84-A (задача 2): видимость секции для паузы морфинга. IO без
   *  rootMargin/threshold: isIntersecting = «хоть пиксель в кадре»;
   *  колбэк приходит сразу на observe — стейт синхронизируется с
   *  фактическим положением секции (в т.ч. при приземлении по #якорю). */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver((entries) => {
      setSectionInView(entries[0].isIntersecting);
    });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  /* c84-A (задача 2): интервал ротации слова. Стартует ТОЛЬКО после
   *  монта (SSR-текст статичен — LCP/SEO не трогаем), стоит при
   *  reduce-motion (a11y: слепой/вестибулярный пользователь не должен
   *  ловить смену слова периферией) и вне вьюпорта (IO-пауза). Все
   *  читаемые значения — в deps (грабля React Compiler).
   *  c84-F3 (критик C, NIT): + lite-гейт — декоративное движение гасим
   *  на слабых/экономных девайсах (идеология c84), слово остаётся
   *  статичным «искусство» (SSR-дефолт). */
  useEffect(() => {
    if (!mounted || reduce || lite || !sectionInView) return;
    const id = window.setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATE_WORDS.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [mounted, reduce, lite, sectionInView]);

  /** W4-FIX «видео-вау»: the clip plays as a muted loop as soon as the
   *  section is near the viewport (muted autoplay is always permitted) and
   *  pauses when it scrolls away — the c89 owner clip
   *  (/media/c89/c89-showcase-720.mp4) is a
   *  DIFFERENT url from the hero's mculinary-hero.mp4 and preload="none"
   *  keeps it out of the critical path. IO rootMargin -15%/-25% (V4-find: было 100px — секция на 917px попадала в margin при scroll=0 на mobile и тизер качался на СТАРТЕ, съедая экономию; теперь play() только когда секция реально в кадре)
   *  starts playback just before the section is revealed. Cleanup pauses
   *  on unmount. prefers-reduced-motion: no IO at all — the poster stays
   *  and the clip plays only after a user click. */
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    /* c89 (3-d) / c98-C / c98-FIX2 (критик4 MAJOR#1): мобильный источник —
     * ВЕРТИКАЛЬНАЯ версия клипа (720×1280, 9/16): контейнер на мобиле
     * вертикальный (класс ниже), 16:9-файл в объект-кавер дал бы зум-кроп
     * с потерей 20-25% контента по бокам — ровно то, на что жаловался
     * владелец («видео в горизонтальном формате»). Подмена src+poster
     * ПЕРЕЕХАЛА в mq-эффект выше (matchMedia "(max-width: 767px)" — тот
     * же брейкпоинт, что у рамки md:aspect-video, + change-листенер и
     * гард играющего видео): прежде детект coarse||<768 расходился с
     * CSS — iPad 768×1024 получал вертикальный файл в 16:9-рамке.
     * Подмена по-прежнему ДО lite/reduce-гейта автоплея ниже: гейт
     * решает только БУДЕТ ЛИ тизер играть сам, а КАКОЙ файл качать по
     * клику «Смотреть» (и какой постер до клика) диктует ориентация
     * кадра — иначе lite/reduce-мобайл кликом получил бы 16:9-файл в
     * вертикальный контейнер = тот же зум-кроп. preload="none" держит
     * байты обоих файлов до play() — мобайл качает только вертикальную
     * копию, десктоп — только 16:9. */

    /* c98-FIX1 (критик1 #6 — фиксация продуктового решения, НЕ дефект):
       lite-автоплей тизера ОТСУТСТВУЕТ осознанно: на lite/девайсе тизер =
       постер (preload="none" — 0 байт), звук и управление — по клику
       «Смотреть» (юзер-жест = осознанный запрос байтов, см. IO-комментарий
       выше). Hero над ним при lite играет 480p-копию — двухуровневая
       политика c98-C: верх экрана живой, тяжесть ниже — по клику. */
    if (reduce || lite) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          /* c84-A (задача 5, mount-race — тот же фикс, что в tott-hero):
             IO-эффект первого коммита стартует с lite=false (стейт
             useLiteDevice поднимается тем же коммитом позже) — при
             приземлении по якорю на lite-девайсе коллбэк успевал
             video.play() до flip-ререндера. Синхронный модуль-кэш
             isLiteDevice() в момент play закрывает окно гонки. Тап по
             пиллу (togglePlay) НЕ гейчен: юзер-жест = осознанный
             запрос байтов, видео включается по нажатию. */
          if (isLiteDevice()) return;
          // Muted in teaser state; when expanded (sound on) the prior
          // click counts as user activation, so unmuted play() is allowed
          // too — a rejection just leaves the native controls in charge.
          void video.play().catch(() => {
            /* autoplay rejected — poster / controls stay */
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: "-15% 0px -25% 0px" },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, [reduce, lite]);

  /** Toggle the play-pill: expanded → unmuted + native controls (+
   *  fullscreen на мобильном); collapsed → back to the muted looping
   *  teaser (the loop keeps running). W4-FIX: collapsing no longer pauses
   *  the clip — the muted b-roll continues.
   *  c98-C (задача 1 — «чтобы работали кнопки открыть во весь экран»):
   *  на мобильном (тот же детект isMobileViewport, что подменяет
   *  источник) клик дополнительно вводит видео в фуллскрин; десктоп —
   *  прежние inline-controls (фуллскрин там не нужен: кадр уже ~720px).
   *  Клик НЕ гейчен lite/reduce (юзер-жест = осознанный запрос байтов,
   *  см. IO-комментарий выше) — слабый девайс играет по нажатию. */
  const togglePlay = () => {
    /* c98-FIX1 (критик1 #10): next — из ref-зеркала (функциональный смысл
       setExpanded(prev=>!prev) без сайд-эффектов в апдейтере): двойной
       синхронный клик в одном тике теперь честный тоггл. */
    const next = !expandedRef.current;
    expandedRef.current = next;
    setExpanded(next);
    const video = videoRef.current;
    if (!video) return;
    if (next) {
      video.controls = true;
      video.muted = false;
      /* СНАЧАЛА play(), ЗАТЕМ fullscreen — оба внутри клика (user
       * activation ещё жив): iOS webkitEnterFullscreen поднимает нативный
       * плеер поверх; известный iOS-глюк «звук без картинки» ловится при
       * входе в фуллскрин ДО старта воспроизведения — порядок обходит.
       * Отказ play (Low Power Mode и т.п.) не мешает фуллскрину: нативный
       * плеер покажет свою кнопку Play. */
      void video.play().catch(() => {
        /* rejected — the user can press play in the native controls */
      });
      if (isMobileViewport()) enterVideoFullscreen(video);
    } else {
      /* c98-C: страховка выхода из фуллскрина при сворачивании (пилюля
       * видна только inline, но десктоп-окно <768 с coarse-мобилой и
       * прочие края добираются сюда; системный выход юзера ловит
       * fullscreenchange-эффект ниже). */
      exitFullscreenSafely();
      video.controls = false;
      video.muted = true;
      // Keep the muted loop alive (IO will pause it once offscreen).
      if (video.paused) {
        void video.play().catch(() => {});
      }
    }
  };

  /* c98-C (задача 1): юзер вышел из фуллскрина СИСТЕМНОЙ кнопкой
   * (назад Android / Done iOS / Esc) — пилюля в фуллскрине не видна,
   * клика по ней не будет: синхронизируем стейт ЗДЕСЬ, иначе остался бы
   * «expanded» (звук + controls) при свёрнутом видео. webkit-префикс —
   * старые Android-webkit. НА iPhone fullscreenchange с
   * webkitEnterFullscreen может НЕ прийти (нативный плеер — не DOM-
   * фуллскрин): тогда стейт ОСТАЁТСЯ честным — нативный плеер закрыт,
   * видео играет inline со звуком и controls, пилюля «Выключить звук»
   * по-прежнему сворачивает (см. C-REPORT.md «известные ограничения
   * iOS»). Юзер-гест уже был → muted-play в восстановлении разрешён. */
  useEffect(() => {
    /* c98-FIX1 (критик1 #2, MINOR): wasOurs — флаг «фуллскрин был НАШ»:
       выставляем при входе ТОЛЬКО если fullscreenElement === наш video.
       Чужие фуллскрины (видео-модалка карусели событий ниже по странице
       входит в нативный fullscreen через свои controls) больше не глушат
       showcase при СВОЁМ выходе: active=null при wasOurs=false — игнор. */
    let wasOurs = false;
    const onFsChange = () => {
      const wk = document as Document & {
        webkitFullscreenElement?: Element | null;
      };
      const active =
        document.fullscreenElement ?? wk.webkitFullscreenElement ?? null;
      if (active) {
        // кто-то ВОШЁЛ в фуллскрин: наш ли — запоминаем; чужой — не трогаем
        if (active === videoRef.current) wasOurs = true;
        return;
      }
      if (!expanded || !wasOurs) return;
      wasOurs = false;
      const video = videoRef.current;
      setExpanded(false);
      expandedRef.current = false; // c98-FIX1: ref-зеркало синхронно со стейтом
      if (!video) return;
      video.controls = false;
      video.muted = true;
      if (video.paused) void video.play().catch(() => {});
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [expanded]);

  /** Reveal-on-scroll helper for overlay-content children. */
  const reveal = (delay: number) =>
    animate
      ? {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, delay, ease: EASE },
        }
      : { initial: false as const, whileInView: undefined };

  return (
    <section
      ref={sectionRef}
      aria-label="Видео: кейтеринг как искусство"
      data-header-theme="dark"
      className="relative w-full bg-black"
    >
      {/* Video frame — GGCatering's 16:9 "aspect-video" on desktop.
          c98-C (задача 1 — владелец: «видео в горизонтальном формате»):
          на мобильном кадр теперь ВЕРТИКАЛЬНЫЙ 9/16 (класс ниже): при
          390px ширины → 693px высоты — редакционный оверлей (H2 +
          субтитл + 2 CTA ≈ 420px, прежний FIX-комментарий) помещается
          с запасом; при самом узком 320px → 569px ≥ прежнего минимума
          560px, поэтому мобильный min-h СНЯТ (9/16 и так даёт достаточную
          высоту, md-сброс больше не нужен). Источник на мобиле —
          вертикальная версия клипа (подмена в mq-эффекте выше, c98-FIX2) — кадр
          1:1 с файлом, БЕЗ зум-кропа 16:9→9/16 с потерей 20-25% контента
          по бокам. Десктоп md+ — БЕЗ ИЗМЕНЕНИЙ (16:9, оверлей как был). */}
      <div className="relative aspect-[9/16] w-full md:aspect-video">
        {/* W4-FIX: ALWAYS-mounted <video> — muted looping teaser, started
            by the IntersectionObserver above and paused offscreen.
            preload="none": the browser downloads nothing until play(); the
            poster attribute covers the pre-play frame (the old static
            <img> is gone — the video poster replaces it 1:1). The clip
            (c89-showcase-720.mp4 — клип владельца c89, 16:9 центр-кроп;
            на мобильном mq-эффект выше подменяет И источник, И постер на
            вертикальную версию c98 — кадр 1:1 с контейнером 9/16) differs
            from the hero video url, so nothing is
            fetched in parallel with the hero. 29.9s, со звуком — тизер
            mute, Play-pill ниже расмучивает по клику (на мобиле — с
            входом в фуллскрин, c98-C задача 1). */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={SHOWCASE_POSTER}
          aria-label="Видео: кейтеринг как искусство — лимонады в диспенсерах и сервировка банкетного стола"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={SHOWCASE_VIDEO} type="video/mp4" />
        </video>

        {/* Dark scrim — Task 4-B readability hardening. Two stacked
            gradients keep the editorial copy WCAG-legible over the video
            both on PAUSE and in MOTION, while the top-right of the frame
            stays clear so the video itself remains visible:
            1) radial — pools black (0.55 → 0) behind the bottom-left text
               column where H2 / subtitle / CTAs sit;
            2) linear to-top — 0.78 bottom (base, up from 0.70), 0.35 mid,
               0.40 top (soft scrim so the overlaid page header stays
               legible). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(130% 90% at 20% 100%, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.28) 48%, rgba(0, 0, 0, 0) 100%), linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0.40) 100%)",
          }}
        />

        {/* Волна 1 / Task 1-c2: GoldDust — золотая пыль над видео.
            Канвас absolute inset-0, pointer-events:none: по DOM-порядку
            НАД видео-скримом (частицы полнотелые поверх затемнения —
            читаются золотом на тёмном), ПОД редакционным контентом
            (контент z-10, Play z-20). rAF с паузами вне вьюпорта,
            reduce-motion → не рендерится. */}
        <GoldDust />

        {/* Editorial overlay — bottom-left aligned with breathing padding.
            z-10 so it sits above the gradient scrim. */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-14 lg:p-20">
          {/* H2 — Playfair Display, white. The word "искусство" is wrapped
              in <i> per the EA signature italic-as-fragment device
              (globals.css `.ea-section-h2 i` colors it `var(--ea-red)`).
              Task 4-B: text-shadow for contrast in motion. W1-FIX: the
              unlayered `.ea-section-h2` rule (color: var(--ea-ink)) beats
              the layered Tailwind `text-white` utility — an inline
              `color: "#fff"` (inline beats both) keeps the H2 white over
              the dark video.
              C77 (владелец): слово «искусство» — ниже на строку: <br/>
              между частями, вторая строка читается как акцентный
              «выдох» курсивом. */}
          <motion.h2
            {...reveal(0)}
            /* c83-B: kinetic-h2 — вес строки растёт со скроллом
                (view-таймлайн, wght 400→700) — утилита c74-kinetic.css,
                reduce/нет-timeline → статический 400 (штатный вид).
                База ea-section-h2 = font-weight 400 — в покое вид
                идентичен прежнему.
                c84-A (задача 1): mb-8 → mb-5 на мобиле — компактнее
                вертикальный стек оверлея, чтобы Play-pill не наезжал
                (pill на мобиле поднят выше, см. Magnetic ниже). */
            className="ea-section-h2 kinetic-h2 mb-5 mt-2 max-w-4xl text-white md:mb-8"
            style={{
              color: "#fff",
              textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)",
            }}
          >
            Кейтеринг как{" "}
            <br />
            {/* c84-A (задача 2, WordRotate): вторая строка — морфинг слов
                искусство → ритуал → спектакль → кино. Требования §52:
                - SSR-HTML несёт статичное «искусство» (видимый спан — одно
                  вхождение в DOM); морфинг стартует после монта (интервал
                  выше);
                - AnimatePresence mode="wait" + initial={false} — первый
                  рендер БЕЗ входной анимации (framer не шипит в SSR
                  инлайн-стили начального состояния), смена слова:
                  exit вверх / enter снизу (y ±60%, ТОЛЬКО
                  transform/opacity, motion.dev-гайд);
                - контейнер фикс. высоты (border-box 1.28em = line-height
                  H2 1.08em + 0.2em запас на десцендеры кириллицы —
                  у/р Playfair выходят за line-box при lh 1.08; строка
                  контейнера стоит на месте ритма H2) +
                  overflow-hidden — смена слова не прыгает по вертикали;
                - a11y/SEO (c99): БЫЛО sr-only «искусство» + видимый
                  анимированный спан — Яндекс читает textContent БЕЗ учёта
                  aria-hidden/sr-only, и два соседних спана склеивались в
                  «искусствоискусство» (мусорный сниппет в выдаче).
                  c99-fix (критик E2-1): убран и aria-hidden со спана —
                  aria-label на генерическом <i> (role=generic) читают
                  НЕ все стеки (NVDA/JAWS в browse-режиме), скрытый текст
                  оставлял такие AT без слова вовсе. Теперь: aria-label
                  берут поддерживающие (по accname subtree не читается —
                  одно вхождение), остальные читают текст спана напрямую;
                  в textContent — по-прежнему ровно одно вхождение.
                  Трейлинг-пробел после «как» — чтобы «сырой» textContent
                  без обработки <br> читался как «Кейтеринг как искусство»;
                - курсив/красный — наследование .ea-section-h2 i;
                  kinetic-h2 wght-анимация H2 не тронута. */}
            <i aria-label="искусство">
              <span
                className="block overflow-hidden"
                style={{ height: "1.28em", paddingBottom: "0.2em" }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={ROTATE_WORDS[wordIndex]}
                    className="block"
                    initial={{ opacity: 0, y: "60%" }}
                    animate={{ opacity: 1, y: "0%" }}
                    exit={{ opacity: 0, y: "-60%" }}
                    transition={{ duration: MORPH_DURATION_S, ease: EASE }}
                  >
                    {ROTATE_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </i>
          </motion.h2>

          {/* Subtitle — white @ 85%, max-w-2xl editorial column.
              Task 4-B: text-shadow for contrast in motion.
              c84-A (задача 1): mb-8 → mb-5 на мобиле (компактный стек
              под пилл), md+ — как было.
              c86-F (перегруженность): было два предложения (~110 знаков)
              — «Каждое блюдо — это режиссура вкуса, света и сервиса. От
              идеи до последнего штриха мы создаём кино, которое можно
              попробовать.» Абстракцию «режиссура вкуса/света/сервиса»
              дублирует сама H2 (искусство/ритуал/спектакль/кино);
              оставлена одна строка с тем же замыкающим «кино, которое
              можно попробовать» (морфинг слова «кино» по-прежнему
              закольцован с субтитлом, c84-A задача 2). */}
          <motion.p
            {...reveal(0.08)}
            className="mb-5 max-w-2xl text-white/85 md:mb-8"
            style={{
              fontFamily: "var(--ea-font-body)",
              fontSize: "clamp(1rem, 1.1vw, 1.1rem)",
              lineHeight: 1.6,
              textShadow: "0 2px 24px rgba(0, 0, 0, 0.55)",
            }}
          >
            Создаём кино, которое можно попробовать — от идеи до последнего
            штриха.
          </motion.p>

          {/* CTA pills — 2 anchors, rounded-full, transparent bg + white
              border + white text; on hover darken the bg + slightly tint
              the border. Mobile stacks vertically, md+ sit side-by-side.
              K2-F1 (Task 3): min-h-[44px] — тач-таргет ≥44 (замер критика:
              41px на части вьюпортов). */}
          <motion.div
            {...reveal(0.16)}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            {CTAS.map((cta) => (
              <a
                key={cta.href}
                href={cta.href}
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights). */
                data-press
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/80 px-6 py-3 text-center text-white transition-colors duration-300 hover:bg-white hover:text-black"
                style={{
                  fontFamily: "var(--ea-font-eyebrow)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  textShadow: "0 1px 16px rgba(0, 0, 0, 0.5)",
                }}
              >
                {cta.label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Centered "Play" pill — toggles unmute + native controls.
            GGCatering's signature interaction: a 1px-white-border pill
            centered over the video, clicking it swaps the muted teaser
            for the full player. We don't have a separate full-video URL,
            so we toggle `muted` + `controls` on the same element.
            K2-F1 (Task 3): тач-таргет — min-height 44px + flex-центровка
            (замер критика: 119×41 < 44). */}
        {/* c83-B (Impl-B): pill обёрнут в Magnetic — тянется к курсору
            (spring; гейты fine-pointer/reduce внутри утилиты — с c83-F1:
            тач/reduce рендерят ту же div-обёртку без магнита и без
            обработчиков). Центровка ПЕРЕЕХАЛА на
            обёртку: Tailwind v4 центрует ПОД-свойством translate, framer
            пишет transform — свойства композиционируются (CSS Transforms
            L2: translate → rotate → scale → transform), прыжка нет;
            data-press (WAAPI-свойство scale) на кнопке по-прежнему не
            пересекается ни с translate, ни с transform (§52).
            Хендлер/aria/data-press кнопки не тронуты.
            c83-F2 (U1a D1): + .gg-play-pill — тонкий hover-scale 1.04
            (transform 300ms EASE, гейты hover/reduce — globals.css);
            Tailwind transition-opacity duration-500 перенесён туда же
            (общий transition-property: opacity, transform). */}
        {/* c84-A (задача 1, FIX перекрытия на мобиле) / c98-C (задача 1 —
            владелец: «кнопка "смотреть" неровно»): расчёт позиции пилла
            в вертикальном кадре 9/16. Оверлей (justify-end) прижимает
            контент-стек (H2 + субтитл + 2 CTA ≈ 350px) к низу — при
            390×693 стек занимает нижние ~50% высоты, свободная зона
            сверху ≈ 343px (49%), её геометрический центр ≈ 24.7% высоты.
            top 27% — чуть НИЖЕ геометрического центра свободной зоны:
            верх кадра у 9/16 заметно «легче» (скрим сверху слабее),
            пилл, посаженный ровно в геоцентр, визуально «уезжал» вверх;
            27% (+ вертикальный translate −50% своего роста) даёт
            сбалансированную посадку с учётом скрима и воздуха, зазор до
            H2 ≥ 130px на 390px, ≥ 40px на 320px. md+ — прежний центр
            секции (десктопный вид не меняется). Magnetic/центровка/
            data-press не тронуты (см. докблоки ниже). */}
        <Magnetic
          className="absolute left-1/2 top-[27%] z-20 flex -translate-x-1/2 -translate-y-1/2 md:top-1/2"
        >
        <button
          type="button"
          onClick={togglePlay}
          /* C79: тач-нажатие — WAAPI-пружина (MicroDelights); Tailwind v4
              центрует через свойство translate — с transform-scale
              WAAPI композиционится без прыжка. */
          data-press
          aria-pressed={expanded}
          /* 81-W2F1 (критик G MAJOR, WCAG 2.5.3 Label in Name): aria-label
             НАЧИНАЕТСЯ с видимого текста кнопки («Смотреть» / «Выключить
             звук») — раньше accname «Включить звук и показать элементы
             управления видео» не содержал видимой надписи вовсе.
             c98-FIX1 (критик1 #1, MAJOR): свёрнутый лейбл ВЕТВИТСЯ по
             платформе — тем же детектом, что решает фуллскрин в togglePlay
             (isMobileView-стейт, SSR-дефолт false = десктоп-текст):
             мобайл — «на весь экран со звуком» (реально: play →
             enterVideoFullscreen), десктоп — прежний честный текст про
             inline-звук+controls («на весь экран» на десктопе было ЛОЖЬЮ
             для скринридера на основной платформе). */
          aria-label={
            expanded
              ? "Выключить звук — скрыть элементы управления видео"
              : isMobileView
                ? "Смотреть — открыть видео на весь экран со звуком"
                : "Смотреть — включить звук и показать управление видео"
          }
          /* c83-F2 (U1a D1): .gg-play-pill — hover-scale 1.04 + переходы
              opacity/transform (гейты hover/reduce в globals.css);
              data-press (WAAPI-свойство scale) не конфликтует. */
          className="gg-play-pill group inline-flex min-h-[44px] items-center justify-center hover:opacity-90"
          style={{
            /* c86-F (читабельность): было transparent — worst-case в зоне
               пила (~27% высоты мобайл, c98-C / центр десктопа: скрим ≈
               0.42) над СВЕТЛЫМ кадром давал 4.2:1 для белого лейбла
               14.4px — ниже AA 4.5. Подложка 0.30 → ≥6.9:1 на любом кадре;
               пилл остаётся призрачным (бордер + сквозь видно видео). */
            background: "rgba(0, 0, 0, 0.3)",
            color: "#fff",
            border: "1px solid #fff",
            borderRadius: "9999px",
            padding: "8px 16px",
            fontWeight: 500,
            fontFamily: "var(--ea-font-eyebrow)",
            fontSize: "0.9rem",
            letterSpacing: "0.04em",
          }}
        >
          {/* Inline glyph + label. Collapsed (teaser): play glyph +
              «Смотреть». Expanded: mute glyph + «Выключить звук» — W4-FIX:
              collapsing no longer pauses the clip (the muted b-roll keeps
              looping), so the "Pause" affordance was wrong; the pill now
              truthfully reads as a sound toggle. */}
          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              aria-hidden="true"
              focusable="false"
              fill="currentColor"
            >
              {expanded ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            {expanded ? "Выключить звук" : "Смотреть"}
          </span>
        </button>
        </Magnetic>
      </div>
    </section>
  );
}

export default GgVideoShowcase;

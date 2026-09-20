"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { isDataSaverLite, isLiteDevice } from "@/lib/lite-device";
import { useDataSaverLite, useLiteDevice } from "@/hooks/use-lite-device";

/**
 * TottHero — Talk of the Town (talkofthetownatlanta.com) hero graft (Cycle 30).
 *
 * Reproduces their Slider-Revolution full-bleed hero composition:
 *   - Full-viewport background VIDEO (their site uses a static photo — we
 *     upgrade to cinematic motion per the task brief: "вместо их фотки хедера
 *     вставить скопированную фотку с другого сайта в классном качестве или
 *     видео". Source: /media/mculinary/mculinary-hero.mp4 — already in-repo,
 *     1280×720 28s loop of real plated food (crostini with cream cheese,
 *     chutney, microgreens). Poster fallback: /media/hero-premium/hero-premium-6.jpg
 *     (Unsplash candlelit wedding dinner, deep bokeh).
 *   - Layered dark gradient overlay so the centered white wordmark reads.
 *   - 5px white border decorative frame inset (their SR7 border shape —
 *     `.tott-border-frame` utility).
 *   - TOP-LEFT script accent (Nothing You Could Do) — mirrors their hero
 *     top-left script overlay ("bacon & bluecheese tartlet"). Ours:
 *     "food as art" — the nilov catering brand tagline in their script font.
 *   - Centered stack: wordmark "nilov / catering." (Prata, two lines,
 *     gold dot) + subtitle
 *     «Кейтеринг полного цикла в Санкт-Петербурге» (Lato, tracked uppercase;
 *     c86-CRIT3: суперлатив «лучший» снят — ст. 5 ФЗ «О рекламе»).
 *   - Scroll cue bottom-center (animated line + "SCROLL" eyebrow).
 *   - NO cities strip, NO long subhead (per task v2: лишняя информация
 *     и города там не нужны).
 *
 * Animation — 81-F1 (performance fixer, критик 81-W1-D): вход текста
 *   ЧИСТЫМ CSS (.hero-stagger / .hero-cue — keyframes hero-rise /
 *   hero-fade-in в globals.css), БЕЗ framer-вариантов и БЕЗ useMounted-гейта:
 *   прежде initial="hidden" шипил в SSR инлайн `opacity:0` на h1 (LCP-элемент)
 *   и красился только после полной гидрации (mobile LCP 10.5s → цель ~3s).
 *   Паттерн Shopify/DebugBear (ресёрч 81-R1/P1): LCP-текст виден в
 *   SSR-разметке, анимируется только transform (opacity вордмарка НЕ
 *   трогаем). Тайминги 1:1 с прежней хореографией: стаггер 0.14с от
 *   delayChildren 0.15 (nth-child 0.15/0.29/0.43), rise 0.85s easeOut,
 *   eyebrow fade 0.7s, scroll-cue fade 0.8s delay 1.3s. ВАЖНО: scroll-cue
 *   — обёртка (позиционирование -translate-x-1/2) + внутренний
 *   анимируемый узел: CSS-transform в keyframes ЗАМЕНЯЕТ computed transform
 *   (грабля §44 — позиционирующий translate живёт на обёртке).
 *   useReducedMotion остался ТОЛЬКО для видео-гейта (IO-эффект ниже);
 *   reduced-motion для hero-входа гейтится в CSS (animation: none).
 * The SiteHeader sits in normal flow AFTER this hero and is sticky top-0 —
 * see site-header.tsx. Hero height lives in globals.css (#hero, c85: полный
 * экран 100dvh/100svh/100vh — прямое указание владельца «во весь экран»)
 * — не в утилите-классе здесь.
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (hero section)
 */
const HERO_VIDEO = "/media/mculinary/mculinary-hero-720.mp4";
/* 81-W2F3 → c82 [владелец: «качество видео на hero на мобильной версии
   стало прям очень плохим» — правка владельца отменяет byte-оптимизацию
   волны-2, §1.6]: мобильная копия была 480×270 / 88kbps / 315KB — на
   390×844 (DPR 2-3) object-cover апскейлит её ×3.5, виден центр ~26%
   полосы → фактическая резкость ~125px на ширину экрана + макроблоки.
   Замена: mculinary-hero-portrait-720.mp4 — вертикальный кроп 480×720
   ЦЕНТРА исходника (x=400..880), закодирован из ОРИГИНАЛА 1.45Mbps
   (не из пережатой -720) в h264 High, crf21/preset-fast, 751kbps,
   2.67MB, faststart, без звука. Кроп = ровно та полоса, которую
   object-cover и так показывает на смартфонах (видимая доля 26-32%
   ширины при aspect 0.39-0.56) — композиция 1:1 с текущей, но весь
   битрейт сконцентрирован в видимой зоне: ~4.5× битов на видимый
   пиксель против десктоп-720, ×30 против старого -480. Планшет
   (aspect ≥0.67) — cover скейлит по ширине, режет высоту: без боксов.
   Подмена источника — в IO-эффекте ДО первого play() (см. там). */
const HERO_VIDEO_MOBILE =
  "/media/mculinary/mculinary-hero-portrait-720.mp4";
/* c98-C (задача B — владелец: «у заказчика на старом компьютере не
   загружается видео херо, только фото, он хочет чтобы видео
   загружалось»): 480p-копии для слабых девайсов (детектируются
   lib/lite-device.ts: cores≤4 не-WebKit / deviceMemory≤2 / FPS-зонд
   p80>40ms). Перекодированы оркестратором из ОРИГИНАЛА в h264:
   десктоп-лайт 640×360 — 711KB, мобайл-лайт 360×640 — 736KB
   (c98-FIX1: фактические размеры; в докблоках было «~300KB» —
   экономия против 720p вдвое меньше расчётной). ПОЛИТИКА c98-C
   двухуровневая: lite (слабое железо) → видео ИГРАЕТ, но 480p;
   dataSaver/2g (isDataSaverLite) → постер (байты дороже вау);
   reduce → постер. Подключение источника — в IO-эффекте ниже. */
const HERO_VIDEO_LITE = "/media/mculinary/mculinary-hero-480-lite.mp4";
const HERO_VIDEO_MOBILE_LITE =
  "/media/mculinary/mculinary-hero-portrait-480-lite.mp4";
/* c98-D (задача владельца: «не нравится фото под видео — поставь
   красивое, чтобы первый экран смотрелся как картина в рамке»):
   замена hero-premium-6 (круглый стол с гигантским цветочным центром,
   еда не видна, статично) на hero-c98 — драматичный фуршетный стол
   (паста с икрой, тартар, канапе, лобстер-роллы, десерты, коктейли,
   сухой лёд-дым), тёмный moody-стоп-кадр той же кинематографической
   лиги, что hero-видео. 2400×1350 JPEG q80 327KB (меньше 595KB
   прежнего), воздух в кадре — вордмарк «nilov catering.» читается.
   Конвейер §4: image-search → VLM-гейт запретов (текст/вотермарки —
   чисто) → sharp. Новое имя файла = cache-bust (§2). */
const HERO_POSTER = "/media/hero-premium/hero-c98.jpg";
/* c98-D: постер видео — 828px WebP-копия нового hero-c98 (57KB, q82).
   Дедупликация с LCP-<Image> прежнего цикла сохранена: тот же визуал,
   один оптимизированный файл в poster-атрибуте. */
const HERO_VIDEO_POSTER = "/media/hero-premium/hero-c98-828.webp";

/* ════════════ Cycle-72 — hero «чистый как картина» (прямое указание
   владельца, §1.3 «пользователь — лучший критик» + §1.6 «вкусовая правка
   юзера отменяет улучшения агента») ════════════

   Удалены ЦЕЛИКОМ (наследие Cycle-71 W3/F4):
   - ценовой якорь «фуршеты от … · банкеты от … · 2 400+ мероприятий…»;
   - CTA-пара «Смотреть меню» / «Рассчитать стоимость».
   Hero остаётся чистой кинематографичной «картиной»: вордмарк +
   script-подпись + eyebrow + scroll-cue. Цены по-прежнему на первом
   экране скролла НЕ ниже (первые ценники — сервис-секция/калькулятор),
   CTA живут в бургер-меню, хедере (после докинга) и теле страницы.
   Возврат eyebrow marginTop 2.5rem (F4 сжимал до 2rem под CTA-пару). */

export function TottHero() {
  const reduce = useReducedMotion();
  /* c84-A (задача 5): единый lite-детектор оркестратора (saveData || 2g ||
     deviceMemory ≤ 2 || cores ≤ 4 + FPS-зонд, контракт
     src/lib/lite-device.ts). c98-C (задача B): lite БОЛЬШЕ не выключает
     видео — стейт теперь (а) выбирает 480p-источник в IO-эффекте и
     (б) перезапускает эффект при флипе (deps), чтобы даунгрейднуть
     источник/погасить видео при включившемся dataSaver.
     c98-FIX1 (критик1 #3): + реактивная трафик-ветка — флип Data Saver
     ПОСЛЕ уже установленного lite не виден deps [reduce, lite]
     (setLite(true)===true — React bailout), а видео должно гаситься
     в постер и на уже-lite-девайсе (becomeLite уведомляет при дельте
     фактора, см. lib/lite-device.ts). */
  const lite = useLiteDevice();
  const dataSaver = useDataSaverLite();
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* FIX-4 [F2, W1-D] §39 «живое видео без фриза: IO + preload="none"» —
   * preload="none": байты видео не запрашиваются, пока play() не вызван
   * IO-гейтом (rootMargin 100px — старт при появлении секции, pause при
   * уходе из вьюпорта — экономия трафика ниже фолда). poster-кадр
   * дедуплицирован с LCP-<Image> и gg-video-showcase.
   *
   * C72-FIX-2 (прямая просьба владельца: «на мобильном hero перестало
   * проигрываться видео, исправь»): C71-гейт «coarse-указатель ИЛИ
   * <768px → IO не создаётся, видео выкл навсегда» СНЯТ. Основание:
   * видео уже не 5.16MB, а 1.49MB (C71-P1 re-encode 720p/440kbps crf31
   * faststart), muted + playsInline допускают autoplay на iOS без жеста
   * юзера. Защиты, которые остались:
   * - saveData / соединение 2g (Network Information API) → постер:
   *   трафик владельца устройства дороже вау-эффекта;
   * - c98-C (задача B): слабое железо (lite: cores/mem/FPS-зонд) БОЛЬШЕ
   *   не гасит видео — играет 480p-копия (711KB/736KB, c98-FIX1: факт
   *   вместо прежней оценки «~300KB»), выбор в эффекте ниже;
   * - мобильный старт ждёт декода LCP-<img> (кап 2.5s) — видео не
   *   конкурирует с первым кадром страницы за канал;
   * - ретрай play() на первом касании — iOS Low Power Mode отклоняет
   *   autoplay, касание легализует старт;
   * - prefers-reduced-motion: IO не создаём — статичный постер (§39).
   */
  useEffect(() => {
    /* c98-C (задача B): гейт ПЕРЕПИСАН — было `reduce || lite` (lite =
       слабое железо ИЛИ трафик — ПОЛНОСТЬЮ выключал видео, старый ПК
       оставался с фото, жалоба владельца), стало `reduce ||
       isDataSaverLite()` (экономия трафика — единственное основание
       показать постер): слабое железо играет 480p-копию (выбор источника
       ниже). deps [reduce, lite, dataSaver]: флип lite (FPS-зонд после
       первого скролла) перезапускает эффект — источник переградится на
       480p-копию по гварду ниже (уже играющее/загруженное 720p НЕ
       перегружается, c98-FIX1); dataSaver-флип (в т.ч. ПОСЛЕ уже
       установленного lite — раньше невидим из-за React-bailout) гасит
       видео: ранний return + cleanup pause() → постер. Стейт dataSaver
       здесь и в deps, и в гейте — live-isDataSaverLite() остаётся
       страховкой mount-race (первый коммит эффекта ещё видит false). */
    if (reduce || dataSaver || isDataSaverLite()) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const isMobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    /* c98-C: слабость читается СИНХРОННО из модуль-кэша (mount-race-паттерн
       c84-A, см. tryPlay ниже) — стейт-lite первым коммитом ещё false, а
       статически слабый ПК (cores≤4 не-WebKit / mem≤2) должен получить
       480p-копию СРАЗУ, без двойной загрузки 720p→480p; зондовый
       даунгрейд доедет ререндером lite=true (deps эффекта) и переградится
       здесь же этим же кодом. */
    const liteNow = lite || isLiteDevice();
    const mobileSrc = liteNow ? HERO_VIDEO_MOBILE_LITE : HERO_VIDEO_MOBILE;
    const desktopSrc = liteNow ? HERO_VIDEO_LITE : HERO_VIDEO;

    /* c98-FIX1 (критик1 #4, MINOR): ГВАРД ЗОНДОВОГО ДАУНГРЕЙДА — ПРАВИЛО:
     *  (1) video.currentSrc уже lite-файл («-lite» в URL) → не трогаем:
     *      это ровно тот источник, что нужен;
     *  (2) видео УЖЕ ИГРАЕТ с данными (paused=false, readyState≥2) → НЕ
     *      подменяем: 720p УЖЕ скачан, пользы от 480p нет, а src-swap
     *      перезапускает загрузку на живом плеере (рывок + флеш постера
     *      + пауза в cleanup); доигрывает скачанное до конца сессии;
     *  (3) иначе (ещё не играет / не успело загрузиться) → подменяем на
     *      lite-копию (экономия байтов ещё возможна).
     * Случай (2) покрывает зондовый даунгрейд ПОСЛЕ первого скролла:
     * FPS-зонд срабатывает на первом скролле, а к этому моменту hero-видео
     * уже играет (readyState≥2) → 720p остаётся до конца сессии. */
    const alreadyLiteSrc = video.currentSrc.includes("-lite");
    const playingWithData = !video.paused && video.readyState >= 2;

    /* 81-W2F3 / c82 / c98-C: источник ставится video.src ПРЯМО на <video>
     * (НЕ <source>.src): по HTML-спецификации установка src-атрибута
     * media-элемента гарантированно перезапускает алгоритм загрузки, а
     * дочерний <source> (720, SSR-разметка не меняется) игнорируется.
     * preload="none" держит байты всех файлов до первого play() — грузится
     * ровно один mp4. ГАРД ПО ТЕКУЩЕМУ АТРИБУТУ (паттерн gg-video-showcase,
     * c98-C): эффект перезапускается (deps reduce/lite/dataSaver) — уже
     * стоящий правильный источник не переприсваиваем (перезапись src
     * перезапустила бы загрузку играющего видео). Десктоп НЕ-lite — прежний
     * <source>-ребёнок 720 (атрибут не трогаем); десктоп-lite — тот же
     * прямой-src паттерн. */
    if (isMobile) {
      if (
        !alreadyLiteSrc &&
        !playingWithData &&
        video.getAttribute("src") !== mobileSrc
      ) {
        video.src = mobileSrc;
      }
    } else if (
      liteNow &&
      !alreadyLiteSrc &&
      !playingWithData &&
      video.getAttribute("src") !== desktopSrc
    ) {
      video.src = desktopSrc;
    }

    let cancelled = false;
    /* c98-FIX1 (критик1 #12): незакрытые ожидания LCP-кадра — снимаются в
     * cleanup (листенер + кап-таймер), а не живут до своей сработки. */
    let pendingImg: HTMLImageElement | null = null;
    let pendingTimer: number | undefined;
    const tryPlay = () => {
      if (cancelled) return;
      /* c84-A (задача 5, mount-race) / c98-C: гейт play — теперь ТОЛЬКО
         экономия трафика: первый коммит эффектов стартует с lite=false
         (useLiteDevice поднимает стейт тем же коммитом ПОСЛЕ этого
         эффекта) — синхронный isDataSaverLite() в момент play закрывает
         окно гонки для saveData/2g (вызванный выше хук уже вычислил окно
         окружения, а IO-коллбэк/тап приходят асинхронно позже).
         Прежний isLiteDevice()-гейт ЗНАЧИТЕЛЬНО шире: он гасил play и на
         слабом железе — теперь им 480p-копия выше, play разрешён
         (задача владельца «видео должно грузиться»). Даунгрейд post-play
         (connection.change) остаётся на ререндер-ветку эффекта
         (deps reduce/lite/dataSaver, c98-FIX1) → cleanup pause(). */
      if (isDataSaverLite()) return;
      // Muted-луп — разрешён всегда; отказ просто оставляет постер.
      void video.play().catch(() => {
        /* autoplay rejected (iOS Low Power Mode и т.п.) — постер
           остаётся, ретрай на первом касании ниже. */
      });
    };

    const playWhenReady = () => {
      if (!isMobile) {
        tryPlay();
        return;
      }
      const img = section.querySelector("img") as HTMLImageElement | null;
      if (!img || img.complete) {
        tryPlay();
        return;
      }
      /* Ждём LCP-кадр: видео не встаёт в очередь раньше первого экрана.
       * c98-FIX1 (критик1 #12): и load-листенер, и кап-таймер снимаются в
       * cleanup эффекта ниже — листенер не переживает компонент/эффект
       * (прежде защищал только cancelled-флаг: tryPlay становился no-op,
       * но листенер и таймер жили до собственной сработки). */
      pendingImg = img;
      img.addEventListener("load", tryPlay, { once: true });
      pendingTimer = window.setTimeout(tryPlay, 2500); /* кап: load может не прийти */
    };

    /* iOS Low Power Mode: первый тап легализует muted-play.
     * c98-FIX2 (критик4 MINOR#4): гард вьюпорта — тап стреляет в ЛЮБОМ
     * месте страницы (юзер доехал до калькулятора momentum-скроллом без
     * касаний), а IO паузит только на ИЗМЕНЕНИЕ пересечения: играющий
     * вне кадра hero жёг декод/байты до конца сессии. section.bottom > 0
     * = секция ещё видна (хоть пиксель ниже верха вьюпорта). Не в кадре —
     * листенеры всё равно снимаются (одноразовый ретрай не копится). */
    const retryOnTouch = () => {
      if (section.getBoundingClientRect().bottom > 0) {
        tryPlay();
      }
      window.removeEventListener("touchend", retryOnTouch);
      window.removeEventListener("touchstart", retryOnTouch);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          playWhenReady();
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(section);
    if (isMobile) {
      window.addEventListener("touchstart", retryOnTouch, { passive: true });
      window.addEventListener("touchend", retryOnTouch, { passive: true });
    }
    return () => {
      cancelled = true;
      io.disconnect();
      video.pause();
      window.removeEventListener("touchend", retryOnTouch);
      window.removeEventListener("touchstart", retryOnTouch);
      /* c98-FIX1 (критик1 #12): честная самоотчистка ожидания LCP-кадра. */
      if (pendingImg) pendingImg.removeEventListener("load", tryPlay);
      pendingImg = null;
      if (pendingTimer !== undefined) window.clearTimeout(pendingTimer);
      pendingTimer = undefined;
    };
  }, [reduce, lite, dataSaver]);

  /** FIX-4: React не сериализует атрибут `muted` в SSR-HTML (known
   *  React #10389) — пиним DOM-свойство на монте, чтобы muted-autoplay
   *  из IO-гейта никогда не отклонялся (как в gg-video-showcase). */
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = true;
  }, []);

  /* c98-C (задача B): страховка «видео не грузится / не декодируется» на
   *  совсем древних браузерах — hero не должен оставаться ПУСТЫМ, если
   *  видео погибло: гасим <video>, приоритетный LCP-постер-<Image> (z-0,
   *  всегда отрендерен) остаётся hero-картиной. Два одноразовых триггера
   *  (hide идемпотентен):
   *   1) error на <video> — В ФАЗЕ CAPTURE: error от <source>-ребёнка НЕ
   *      всплывает, но ловится родителем в capture-фазе (десктоп без
   *      src-подмены грузит именно через <source>);
   *   2) watchdog «старт был, кадра нет»: через 8с после события play
   *      readyState < 2 (HAVE_CURRENT_DATA — ни одного кадра) → декодер
   *      мёртв/сеть встала. Событие playing (кадры пошли) снимает таймер;
   *      re-play (IO-возврат, тап-ретрай) перевзводит его.
   *  Работает независимо от lite-политики — слабый ПК должен ВИДЕТЬ видео
   *  (задача владельца), фолбэк — только на реальный сбой. Хирургию
   *  src/load() намеренно НЕ делаем: load() без src-атрибута
   *  ПЕРЕВЫБИРАЕТ <source>-ребёнка и ПЕРЕЗАПУСКАЕТ загрузку 720p —
   *  обратный эффект; display:none + pause() достаточно (на error-пути
   *  браузер уже оборвал сам запрос). */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const hide = () => {
      video.pause();
      video.style.display = "none"; /* постер-<Image> под ним остаётся */
    };
    video.addEventListener("error", hide, { once: true, capture: true });
    let watchdog: number | undefined;
    const onPlay = () => {
      window.clearTimeout(watchdog);
      watchdog = window.setTimeout(() => {
        /* readyState < 2 = HAVE_CURRENT_DATA нет — ни кадра за 8с. */
        if (video.readyState < 2) hide();
      }, 8000);
    };
    const onPlaying = () => window.clearTimeout(watchdog);
    video.addEventListener("play", onPlay);
    video.addEventListener("playing", onPlaying);
    return () => {
      window.clearTimeout(watchdog);
      video.removeEventListener("error", hide, { capture: true });
      video.removeEventListener("play", onPlay);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-header-theme="transparent"
      aria-label="nilov catering — кейтеринг полного цикла в Санкт-Петербурге"
      /* c85 (указание владельца: «херо надо чтобы было во весь экран»):
         высота живёт в globals.css (#hero — id-специфичность бьёт
         утилиту): 100vh → 100svh → 100dvh (динамический вьюпорт —
         ровно видимая высота при любом состоянии адресной строки
         iOS/Android). Прежний 92svh-peek снят; сигнал «можно листать» —
         scroll-cue «Листайте» + .hero-bottom-fade (тёмный пьедестал
         низа). Cookie-баннер первого визита прячет cue правилом
         body.cookie-banner-open .hero-cue-wrap { visibility: hidden }
         (globals.css). */
      className="relative w-full overflow-hidden bg-black"
      /* F4 / задача 2 (K1 MAJOR «first-paint крем-вспышка»): инлайновый
         SSR-гейт — тёмный espresso-фон секции сериализуется прямо в HTML,
         первый кадр под (ещё не загрузившимся) постером гарантированно
         тёмный = итоговому виду. Инлайн-стиль сильнее Tailwind-класса
         bg-black, поэтому класс оставлен как дублирующий фолбэк.
         САМА вспышка — двери прелоадера (preloader.tsx, крем-градиент
         from-cream to-parchment, чужой файл) — см. отчёт F4. */
      style={{ backgroundColor: "#0A0908" }}
    >
      {/* Background image — LCP priority (next/image). Sits at z-0 and acts
          as the video poster (the video overlays it once playing). */}
      <Image
        src={HERO_POSTER}
        alt="Банкетный стол при свечах — кейтеринг nilov catering"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 z-0 size-full object-cover"
      />

      {/* Background video — cinematic motion (replaces talkofthetown's static
          hero photo per task brief). Overlays the poster image (z-10) once it
          begins playing. object-cover fills viewport; muted + playsInline for
          autoplay + iOS compliance.
          FIX-4 [F2]: preload="none" + IO-гейт (см. эффект выше) — 5.16MB
          уходит из критического пути; poster = HERO_POSTER (дедуп с
          gg-video-showcase). autoPlay-атрибут убран — старт выдаёт IO,
          hero в вьюпорте с первой секунды, визуал не меняется.
          C71-P1 (Task 2+5): poster → HERO_VIDEO_POSTER (готовый 828w webp
          67KB вместо RAW jpg 595KB — двойная загрузка hero-кадра устранена,
          K8-CRITICAL); источник видео → re-encode 720p/440kbps crf31
          faststart (1.49MB вместо 5.16MB, новое имя = cache-bust; старый
          файл не удаляем — конвенция §28). */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-[1] size-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster={HERO_VIDEO_POSTER}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* Layered overlays: center-weighted darkening so the white wordmark
          reads against any video frame, plus a bottom gradient so the
          bottom-docked nav (cream bg when scrolled) blends. */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/55 via-black/25 to-black/65"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.6)_100%)]"
        aria-hidden="true"
      />

      {/* c84-A (задача 4b): мягкий фэйд низа hero (см. .hero-bottom-fade в
          globals.css) — белый срез выглядывающей шапки под 92svh-героем
          читается как осознанная граница, cue получает тёмный пьедестал. */}
      <div className="hero-bottom-fade z-[2]" aria-hidden="true" />

      {/* 5px white border decorative frame — talkofthetown SR7 signature. */}
      <span className="tott-border-frame z-[3]" aria-hidden="true" />

      {/* CENTERED brand stack — per task v10: 3 lines, shifted DOWN for
          better optical balance (W1-FIX: translateY +40px — при +60px на
          1440×900 eyebrow «ЛУЧШИЙ КЕЙТЕРИНГ…» пересекался со scroll-cue
          «ЛИСТАЙТЕ»; +40 + bottom-12 (было bottom-28) дают зазор ≥8px), "food
          as art" made larger, and the eyebrow label wraps cleanly on mobile
          ("Кейтеринг полного цикла" / "в Санкт-Петербурге") via an explicit <br> that
          only shows on small screens (hidden sm:inline).
          Composition:
            1. "nilov" / "catering." — massive high-contrast serif (Prata),
               two explicit lines (block spans — никогда не рвётся посреди
               слова, §1.5), gold dot after "catering"
            2. "food as art" — handwritten script (Nothing You Could Do),
               nestled tight below the wordmark (negative margin, signature)
            3. "ЛУЧШИЙ КЕЙТЕРИНГ" / "САНКТ-ПЕТЕРБУРГА" — small uppercase
               tracked sans-serif eyebrow (Lato via Karla Cyrillic fallback),
               wraps to 2 lines on mobile (break after "кейтеринг"), single
               line on sm+ screens. Generous editorial whitespace below the
               script pair.
          Text-shadow on white text for video-bg legibility. */}
      <div className="hero-stagger absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center [transform:translateY(40px)]">
        {/* Wordmark — Prata (high-contrast serif). Two stacked lines
            "nilov" / "catering." — вау-композиция: широкая строка
            "catering." (~4.1em) при 15vw занимает ~62vw — влезает и на
            мобиле, и на десктопе. Разрыв строк — осознанный (block-спаны
            по границе слов), mid-word перенос невозможен. Золотая точка
            после "catering" — фирменный акцент. Mobile floor 3.5rem
            держит иерархию над script-флор 2.25rem (task v11) и
            гарантирует, что "catering." не упирается в px-6-поля на
            320px-экранах. */}
        <h1
          /* Cycle 40 SEO fix: the visible wordmark alone carries no keywords;
             aria-label gives search engines «кейтеринг полного цикла
             Санкт-Петербурга» without changing the visual design. */
          aria-label="nilov catering — кейтеринг полного цикла в Санкт-Петербурге"
          className="tott-display text-white"
          style={{
            fontSize: "clamp(3.5rem, 15vw, 10rem)",
            lineHeight: 0.93,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          <span className="block">nilov</span>
          <span className="block">
            catering<span style={{ color: "var(--gold)", marginLeft: "0.05em" }}>.</span>
          </span>
          {/* F4 / K3 SEO: визуально невидимое продолжение вордмарка — ключи
              «кейтеринг в Санкт-Петербурге» попадают в текстовое содержание
              H1 (Tailwind sr-only = clip-паттерн, см. stage-services.tsx).
              aria-label H1 уже несёт «кейтеринг полного цикла Санкт-Петербурга» —
              видимая часть «nilov catering» вложена в него (WCAG 2.5.3). */}
          <span className="sr-only"> — кейтеринг в Санкт-Петербурге</span>
        </h1>

        {/* Script tagline — Nothing You Could Do (Latin script font). Nestles tight
            under the wordmark (negative mt) for a signature/underline feel.
            Per user: "food as art" stays in English — латинский скрипт-акцент
            над латинским вордмарком «nilov catering» (food ↔ catering),
            фонетика и семантика читаются одинаково в обеих локáлях.
            Tilted -6° (rotate) for a handwritten signature gesture — mirrors
            gamma's tilted-accent device. The rotation lives on an inner
            <span> so the hero-rise CSS entry (translateY) on the outer <p>
            never touches it.
            Size kept smaller than the wordmark (floor 2.25rem vs 4rem) so the
            visual hierarchy holds on narrow screens. */}
        <p
          className="tott-script text-white/95"
          style={{
            fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
            lineHeight: 1,
            /* W1-FIX: -0.5rem давал пересечение line-box'ов «catering.» и
               «food as art» на 8px @390×844 (замер критика); 0.25rem
               даёт 4px зазор. */
            marginTop: "0.25rem",
            textShadow: "0 2px 30px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: "rotate(-6deg)",
              transformOrigin: "center",
            }}
          >
            food as art
          </span>
        </p>

        {/* Eyebrow label — Lato (sans-serif, .tott-body) ALL CAPS, small,
            wide letter-spacing. Per task v10: "сделай чтобы на мобильных
            версиях переносился кейтеринг полного цикла, а следующая строка Санкт-
            Петербурга" — explicit <br className="sm:hidden"> after "кейтеринг"
            forces the wrap on mobile only; on sm+ screens the <br> is hidden
            so the label renders as one line. Generous editorial whitespace
            below the script pair (mt-10). padding-left optically centers
            the tracked label.
            c84-A (задача 3, читаемость): clamp 11px → 12.5px на мобиле —
            владелец: «некоторым слишком мелко, но должно остаться
            красиво» (капс-лидер, трекинг/кегель-пропорции сохранены). */}
        <p
          className="tott-body text-white/85"
          style={{
            fontSize: "clamp(13.5px, 1.4vw, 14px)",
            lineHeight: 1.4,
            letterSpacing: "0.35em",
            fontWeight: 700,
            textTransform: "uppercase",
            /* Cycle-72: 2rem (F4-бюджет под CTA-пару) → 2.5rem — исходные
               «щедрые» редакционные отступы, CTA-пары больше нет. */
            marginTop: "2.5rem",
            paddingLeft: "0.35em",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          Кейтеринг полного цикла
          <br className="sm:hidden" />
          {" "}в Санкт-Петербурге
        </p>
      </div>

      {/* Scroll cue bottom-center (sits above the docked nav). W1-FIX:
          bottom-12 (was bottom-28) — at 1440×900 the cue overlapped the
          eyebrow label; measured gap after the fix ≥8px.
          81-F1: обёртка владеет ПОЗИЦИОНИРОВАНИЕМ (left-1/2
          -translate-x-1/2), внутренний .hero-cue узел — входом (opacity):
          CSS-transform в keyframes заменяет computed transform, поэтому
          позиционирующий translate обязан жить на РОДИТЕЛЕ (грабля §44).
          c84-A (задача 4c): + .hero-cue-wrap на обёртке — уход cue при
          прокрутке привязан к именованному #hero view-таймлайну
          (--hero-exit, globals.css): opacity 1→0 на первых ~25% exit.
          Анимируется ТОЛЬКО opacity обёртки (никакого transform —
          позиционирующий перевод не трогаем). Линия — .hero-cue-line:
          пульс scaleY на собственном узле без других transform;
          reduced-motion → animation:none (CSS-гейт). */}
      <div
        className="hero-cue-wrap absolute bottom-12 left-1/2 z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="hero-cue flex flex-col items-center gap-2">
          {/* c84-A (задача 3, читаемость): 13px → 14px. */}
          <span className="tott-body text-[14px] font-bold uppercase tracking-[0.35em] text-white/85">
            Листайте
          </span>
          <span
            className="hero-cue-line block w-px bg-white/40"
            style={{ height: 54 }}
          />
        </div>
      </div>
    </section>
  );
}

export default TottHero;

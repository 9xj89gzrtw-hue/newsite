"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import "./ea-founder-story.css";
import "@/components/motion/c74-kinetic.css";

/**
 * EaFounderStory — Cycle 66 redesign: «Хроника одних рук».
 *
 * Полный редизайн секции #about по концепту из research/c66/FOUNDER-RESEARCH.md
 * (эталоны: La Table de Joakim — основатель = лицо кухни; Dishoom — founding
 * myth «одна печь, съёмная кухня»; Monarque — vision-подача; GEM — subtle
 * motion).
 *
 * c86-C (жалоба владельца: числа стареют — «через год-два будет неактуально»):
 * строка статистики и вся её машинерия удалены целиком, копирайт секции
 * переписан кейтеринг-первично — ремесло, команда, ритуал застолья, работа
 * на любой площадке. Цифр в About больше нет; место стата заняла личная
 * строка-цитата основателя (тем же fadeUp-таймингом — ритм секции сохранён).
 *
 * ТЁМНАЯ editorial-секция (первая в нише about): тёплый ink #161312, cream
 * текст, зернистость CSS-only (SVG feTurbulence, opacity 0.055) + статичный
 * тёплый bloom. data-header-theme="dark" — потребитель (флип шапки на
 * тёмный вариант) реализован в site-header (FX5, волна-B c67).
 *
 * Структура (desktop ≥1024):
 *   ЛЕВАЯ (46%) — sticky (top 110px) дуэт-фото: портрет 3/4 (вход clip-path
 *   снизу + inner zoom 1.12→1.0) + карточка-сцена 42% внахлёст справа-снизу
 *   (белая рамка 4px, вход clip «шторка» слева→направо + rotate −10°→−5°,
 *   delay 0.4s; hover — lift + выпрямление). Дифференциальный scrub-дрейф
 *   фото по Y (±22px, противофаза) — MotionValues, ноль setState на кадр.
 *   За контентом на всю ширину низа — гигантское outlined «Нилов» (в JSX
 *   title-case, uppercase даёт CSS text-transform; Playfair, cyrillic ✓,
 *   stroke cream 15%) со scrub-дрейфом по X (±40px; на <768 — ±14px,
 *   FIX-6/W1-A MINOR-1, вместе с мобильным капом 16.5vw в CSS).
 *   ПРАВАЯ (54%) — eyebrow «ОСНОВАТЕЛЬ · НАША ИСТОРИЯ», H2 «Накрываем ваш
 *   стол» (italic-фрагмент — канон сайта), красный hairline, 3 МИНИМАЛЬНЫЕ
 *   главы (Начало / Философия / Команда), строка-цитата основателя (c86-C:
 *   на месте прежней строки статистики, без цифр), подпись Marck Script
 *   «чернильным» clip-reveal, CTA «Смотреть меню и пакеты» (scrollToMenu:
 *   window.__lenis → lenis → native, §33).
 *
 * Мобайл (<1024): без sticky; фото → текст; сцена-карточка внахлёст; reveal-ы
 * короче (matchMedia-гейт, post-mount).
 *
 * §34/§35 hydration-дисциплина:
 *   - mounted-гейт: SSR и ПЕРВЫЙ клиентский рендер = полностью статичная
 *     секция (в SSR-разметке нет opacity:0 — no-JS видит весь контент).
 *   - settled = mounted && !reduce; ветвление анимационных пропсов ТОЛЬКО
 *     через settled, дерево не ветвится до mount (гидра-мина useReducedMotion).
 *   - все входные анимации навешиваются key-ремонтом при флипе settled
 *     (§35 «initial не перевооружается пост-монтом»).
 *   - clip-path строки — одинаковая токен-структура + animate-prop паттерн
 *     (§34, проверено на обложке-вайпе); transform/opacity/clip-path only.
 *   - overflow-x: clip (не hidden) на секции — sticky жив (§2).
 *   - бесконечных анимаций нет; background-attachment: fixed нет.
 *
 * Доступность: landmark + aria-labelledby; декор (слово/bloom/зерно/делители)
 * aria-hidden; честные alt (VLM-сверка фактического содержимого кадров);
 * контраст (замер research/c67/fix + 81-W2F2): cream ≈17:1 (AAA), muted 6.3:1,
 * мелкий акцент #C9A227 7.64:1 (81-W2F2: лосось #FF6B77 выведен из палитры —
 * золото тёмных секций, как cookie-banner/not-found); красный --ea-red
 * остался только в h2 i и hairline (подпись переведена на cream — F16);
 * focus-ring CTA 2px ≥3:1.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* Тезисные главы — c103: новый текст владельца о ресторанной дисциплине
   (без рекламных клише, с опорой на личную ответственность основателя
   и устранение главных страхов заказчика: холодные блюда, тайминг,
   суета). Метки глав синхронизированы с новым содержанием. */
const CHAPTERS = [
  {
    label: "Миссия",
    text: "Я создал Nilov Catering с одной целью — переломить стереотип о выездном обслуживании как о «доставке остывшей еды в боксах». Наш стандарт — это полноценный гастрономический ресторан, развёрнутый на вашей площадке. С той же бескомпромиссной свежестью продуктов, авторскими рецептурами и выверенной до миллиметра эстетикой подачи.",
  },
  {
    label: "Команда",
    text: "За каждым фуршетом или банкетом стоит строгое технологическое производство на Полевой Сабировской и работа команды, обученной по классическим ресторанным стандартам. Мы заранее просчитываем сценарий мероприятия: от температурного режима горячих блюд и тонкого фарфора до бесшумной, незаметной работы официантов, которые появляются ровно в ту секунду, когда это необходимо.",
  },
  {
    label: "Гарантия",
    text: "Моё имя в названии компании — это персональная гарантия. В день вашего события вы должны быть главным гостем на собственном празднике, чувствовать абсолютную уверенность и наслаждаться общением, не отвлекаясь ни на одну организационную деталь.",
  },
] as const;

/**
 * Smooth-scroll к #menu для CTA «Смотреть меню». Cycle 66: основной путь —
 * window.__lenis (грабля §33: Lenis перебивает программные smooth-скроллы,
 * провайдер экспортирует инстанс как __lenis), затем легаси window.lenis,
 * финальный фоллбек — нативный scrollIntoView. (?? здесь безопасен: слева
 * чтения свойств, не void-вызовы — §34.)
 *
 * Ретаргет-паттерн (замер оркестратора cycle 66): lenis.scrollTo(element)
 * вычисляет цель ОДИН раз на момент вызова, а лэйаут ВЫШЕ #menu дрейфует
 * во время полёта (ленивые next/image, дев-оптимизация — замер: цель уехала
 * на +862px, анимация сошлась к устаревшей точке). Повторные вызовы scrollTo
 * пересчитывают rect элемента в момент вызова — дрейф поглощается повторами
 * (паттерн hacc-booking V7). В проде с кэшированными картинками дрейф мал,
 * но anchor-jump-навигация получает тот же риск — паттерн на оба случая.
 *
 * F5 (волна-A): безусловные ретаргеты на 650/1250ms насильно возвращали
 * юзера, который во время полёта крутанул колесо вверх. ПЕРВОЕ намерение
 * (wheel/touchstart/keydown, passive) отменяет отложенные таймеры — юзер-
 * скролл побеждает. Страховочный таймер 2200ms чистит слушатели после
 * приземления (полёт 1.1s + ретаргеты ≤ 1.75s).
 */
function scrollToMenu() {
  if (typeof window === "undefined") return;
  const target = document.getElementById("menu");
  if (!target) return;
  const w = window as unknown as {
    __lenis?: { scrollTo?: (t: Element, o?: { offset?: number; duration?: number }) => void };
    lenis?: { scrollTo: (t: Element, o?: { offset?: number; duration?: number }) => void };
  };
  const lenis = w.__lenis ?? w.lenis;
  if (lenis?.scrollTo) {
    // Ретаргет: цель пересчитывается на каждый вызов (lenis читает rect
    // элемента в момент вызова) — лэйаут-дрейф выше #menu (ленивые фото,
    // дев-оптимизация) поглощается повторами. Паттерн hacc-booking V7.
    lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    const timers = [
      window.setTimeout(() => lenis.scrollTo?.(target, { offset: 0, duration: 0.7 }), 650),
      window.setTimeout(() => lenis.scrollTo?.(target, { offset: 0, duration: 0.5 }), 1250),
    ];
    // Отмена по первому юзер-намерению (см. F5 в докблоке). Взаимное снятие
    // всех трёх слушателей; вызов после их же снятия — безопасен.
    const cancelRetargets = () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("wheel", cancelRetargets);
      window.removeEventListener("touchstart", cancelRetargets);
      window.removeEventListener("keydown", cancelRetargets);
    };
    window.addEventListener("wheel", cancelRetargets, { passive: true });
    window.addEventListener("touchstart", cancelRetargets, { passive: true });
    // FX9 (волна-B): keydown тоже passive — обработчик не вызывает
    // preventDefault (только снимает таймеры и слушатели), нечему блокировать.
    window.addEventListener("keydown", cancelRetargets, { passive: true });
    window.setTimeout(cancelRetargets, 2200);
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function EaFounderStory() {
  const reduce = useReducedMotion();

  // §34 mounted-гейт: первый клиентский рендер обязан совпадать с SSR.
  // settled=true — единственная дверь ко всем входным анимациям.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const settled = mounted && !reduce;
  const on = settled ? "on" : "off"; // суффикс key-ремонта (§35)

  // Мобильные reveal-ы короче (task: «все reveal-ы остаются, но короче»).
  // post-mount matchMedia — hydration-безопасно (как isCoarse в tott).
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // FIX-6 (W1-A MINOR-1): амплитуда X-дрейфа «НИЛОВ» на узких экранах.
  // Тот же §34-паттерн, что narrow выше: post-mount matchMedia — SSR и
  // первый клиентский рендер совпадают (false = десктопная амплитуда),
  // свап амплитуды после монта. Перевооружение честное: в framer-12
  // useCombineMotionValues пересчитывает combine-замыкание синхронно в
  // каждом рендере (updateValue() в теле хука) — при флипе wordNarrow
  // useTransform тут же пересобирается с новой амплитудой, пружина
  // перевозит значение плавно. settled-гейт ниже прикручивает x только
  // после монта — флеша десктопной амплитуды на мобиле нет (оба setState
  // из одного flush эффектов монта — один ререндер).
  const [wordNarrow, setWordNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setWordNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // FX2 (волна-B): вход сцены (1.0s + delay 0.4) раньше наследовался
  // возвратом из hover — после ухода курсора стояло ~505ms мёртвого delay
  // и ~1.0s плавного возврата. sceneEntered взводится onAnimationComplete
  // входа: ПЕРВЫЙ вход сохраняет delay 0.4s, каждый возврат из hover после
  // — короткий (0.35s) и мгновенный. Пишется только в колбеке (React
  // Compiler §37: ref-записи в рендере запрещены — использую state).
  const [sceneEntered, setSceneEntered] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);

  /* C74 (E3) «фонарик»: ref подвижного свечения. Слой и стили —
     efs__spot / efs__spot-glow (ea-founder-story.css), гварды —
     (hover:hover)+(pointer:fine) и в CSS, и в JS (двойная защита
     мобайла). */
  const spotGlowRef = useRef<HTMLDivElement>(null);

  /* ── C74 (E3) «фонарик» — курсорный светильник над точечной сеткой ──
     Тренд 2026: joshwcomeau.com «flashlight», wearedevelopers «Spotlight
     Text Effect» (10.2025), webflow «Spotlight Hover» — радиальное свечение
     следует за мышью, проявляя точечную текстуру секции («музейный
     фонарик» над призрачным «НИЛОВ»).
     Перф-модель: точки — статичный фон обёртки (репейнт один раз);
     свечение 600×600 — ЕДИНСТВЕННЫЙ подвижный слой, движение ТОЛЬКО
     transform (композитор). Трекинг — синхронная запись transform прямо
     в pointermove (§44/C73: без rAF-батчинга, без React-state — свечение
     в том же кадре, что и системный курсор, отставание исключено).
     Один gBCR на событие — браузер батчит, паттерн TiltCard.
     Fine pointer only: touch-скролл сечение не трогает. */
  useEffect(() => {
    const section = sectionRef.current;
    const glow = spotGlowRef.current;
    if (!section || !glow) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let visible = false;
    const show = () => {
      if (!visible) {
        visible = true;
        glow.style.opacity = "1";
      }
    };
    const hide = () => {
      if (visible) {
        visible = false;
        glow.style.opacity = "0";
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = section.getBoundingClientRect();
      glow.style.transform = `translate3d(${e.clientX - r.left - 300}px, ${
        e.clientY - r.top - 300
      }px, 0)`;
      show();
    };
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", hide);
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", hide);
    };
  }, []);

  // useInView — на ВСЕГДА присутствующих обёртках (refs не ремоунтятся,
  // булевы стабильны при key-флипе внутренних слоёв).
  // margin -60px (не -80px): запас против anchor-jump на #about — замер
  // оркестратора (390×844): портрет top=89px срабатывал с запасом лишь 9px;
  // чуть иной паддинг — и reveal не сработал бы навсегда (clip inset(100%)).
  // Для элементов, входящих снизу, верхний инсет не участвует — скролл-поведение
  // не меняется, растёт только запас на краю (замер diag: clip inset(0%)).
  const portraitInView = useInView(portraitRef, { once: true, margin: "-60px" });
  const sceneInView = useInView(sceneRef, { once: true, margin: "-60px" });
  const signInView = useInView(signRef, { once: true, margin: "-80px" });

  // F19 (волна-A): на anchor-jump #about ленивая загрузка портрета гонка с
  // clip-reveal — кадр «выскакивал» наполовину загруженным. Reveal стартаует
  // только после img.decode() (race с 800ms-фоллбеком: reveal всегда
  // срабатывает ≤800ms). Decode зовётся ТОЛЬКО при inView — loading="lazy"
  // сохранён, вне вьюпорта ничего не форсируется. Reduce/no-JS: анимации нет
  // (settled=false), гейт не участвует.
  const [portraitReady, setPortraitReady] = useState(false);
  useEffect(() => {
    if (!portraitInView || portraitReady) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) setPortraitReady(true);
    };
    const fallback = window.setTimeout(done, 800);
    /* c117: селектор ЦЕЛЕВОЙ — в рамке теперь живёт LQIP-заглушка (data-URI,
       декодируется мгновенно), bare «img» открыл бы гейт до реального кадра. */
    const img = portraitRef.current?.querySelector<HTMLImageElement>("img.efs__portrait-img");
    if (img) {
      img.decode().then(done, done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [portraitInView, portraitReady]);

  /* c117 (владелец: «чёрный прямоугольник, потом фото»): decode-гейт для
     КАРТОЧКИ-СЦЕНЫ — прежде «шторка» открывалась по sceneInView без
     ожидания кадра: на холодном кэше под белой рамкой виден был чёрный
     фрейм #0e0b0a. Теперь шторка ждёт decode (фоллбек 800мс — как у
     портрета; LQIP под шторкой страхует остаток гонки). */
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    if (!sceneInView || sceneReady) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) setSceneReady(true);
    };
    const fallback = window.setTimeout(done, 800);
    const img = sceneRef.current?.querySelector<HTMLImageElement>("img.efs__scene-img");
    if (img) {
      img.decode().then(done, done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [sceneInView, sceneReady]);

  // Scrub-дрейф: один useScroll + useTransform-слайсы + useSpring —
  // MotionValues, ноль setState на кадр (§35). Только transform.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // F10 (волна-A): 55/22 тащил упругий хвост (дрейф −32→+2px ~900ms после
  // резкого стопа — скорость, накопленная скроллом, давала перелёт даже при
  // формально overdamped пружине). 90/26 гасит заметно быстрее — замер в
  // research/c67/fix.
  const springOpts = { stiffness: 90, damping: 26, mass: 0.6 } as const;
  // FIX-6 (W1-A MINOR-1): ±40px на <768 при word-боксе во всю ширину секции
  // держали глифы в 8.95px от кромок overflow-x:clip на 390 (реальный текст
  // Playfair-500 ≈3.94em/слово; на 320 — 0.2px, обводка резалась). <768 —
  // ±14: с мобильным капом 16.5vw (ea-founder-story.css) инвариант задачи
  // «слово + 2×амплитуда ≤ 100vw» выполняется с запасом ≥50px на 320–414.
  // 768–1023 и desktop ≥1024 — прежние ±40 (там запас; десктоп не тронут).
  const wordAmp = wordNarrow ? 14 : 40;
  const wordX = useSpring(
    useTransform(scrollYProgress, [0, 1], [wordAmp, -wordAmp]),
    springOpts,
  );
  const portraitY = useSpring(useTransform(scrollYProgress, [0, 1], [22, -22]), springOpts);
  const sceneY = useSpring(useTransform(scrollYProgress, [0, 1], [-14, 18]), springOpts);

  // Fade-up вход текста: 26px, stagger 80–120ms; на мобиле короче/плотнее.
  const fadeUp = (delay: number) =>
    settled
      ? {
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: {
            duration: narrow ? 0.6 : 0.8,
            delay: narrow ? delay * 0.7 : delay,
            ease: EASE,
          },
        }
      : {};

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="ea-founder-story-headline"
      data-header-theme="dark"
      className="efs"
    >
      {/* Тёплый bloom — статичный, один слой, не отвлекает (EA restraint). */}
      <div className="efs__bloom" aria-hidden="true" />

      {/* C74 (E3) «фонарик»: точечная сетка + курсорное свечение.
          z-2 — НАД призрачным «НИЛОВ» (z-1), ПОД контентом (z-10).
          overflow:hidden — свечение не выходит за границы секции. */}
      <div className="efs__spot" aria-hidden="true">
        <div className="efs__spot-glow" ref={spotGlowRef} />
      </div>

      {/* Гигантское outlined «НИЛОВ» — signature-typography на всю ширину
          низа. Декор: aria-hidden, pointer-events none. Дрейф — только
          когда settled (SSR = чистая статика без transform). */}
      <motion.div
        className="efs__word"
        aria-hidden="true"
        style={settled ? { x: wordX } : undefined}
      >
        Нилов
      </motion.div>

      <div className="efs__container">
        <div className="efs__grid">
          {/* — — ЛЕВАЯ: sticky дуэт-фото (мобайл: обычный поток, фото первым) — — */}
          <div
            className="efs__media"
            /* c117: в правом нижнем углу этого блока висит карточка-сцена
               (белая рамка, дизайн-элемент) — при входе в секцию телефон-FAB
               (fixed 16/16) наезжал на неё (замер 390px: перекрытие 39px на
               y≈7000). data-fab-shy: ContactWidget уступает, пока блок в
               нижней полосе вьюпорта (IO -83%, гистерезис 300мс). */
            data-fab-shy=""
          >
            <motion.div
              ref={portraitRef}
              className="efs__portrait-pos"
              style={settled ? { y: portraitY } : undefined}
              /* C78: двойной тап по портрету — золотые искры
                  (MicroDelights, декоративный data-атрибут — transform
                  портрета не трогает). */
              data-spark
            >
              {/* Вход портрета: clip inset(100%→0) снизу-вверх + inner zoom
                  1.12→1.0. §34 паттерн: initial + animate по useInView
                  (строки одной токен-структуры), key-ремонт при settled-флипе. */}
              <motion.div
                key={`pclip-${on}`}
                className="efs__portrait-clip"
                {...(settled
                  ? {
                      initial: { clipPath: "inset(100% 0% 0% 0%)" },
                      animate:
                        portraitInView && portraitReady // F19: ждать decode кадра
                          ? { clipPath: "inset(0% 0% 0% 0%)" }
                          : undefined,
                      transition: { duration: narrow ? 0.9 : 1.1, ease: EASE },
                    }
                  : {})}
              >
                <motion.div
                  className="efs__portrait-zoom"
                  {...(settled
                    ? {
                        initial: { scale: 1.12 },
                        animate:
                          portraitInView && portraitReady // F19: ждать decode кадра
                            ? { scale: 1 }
                            : undefined,
                        transition: { duration: narrow ? 1.15 : 1.4, ease: EASE },
                      }
                    : {})}
                >
                  <div className="efs__portrait-frame">
                    {/* c117 (владелец: «сначала чёрный прямоугольник, потом
                        фото»): LQIP-подложка — 24px WebP (data-URI, 0 сети)
                        с CSS-blur: пока кадр лениво грузится, рамка показывает
                        мягкое размытое фото, а не чёрный #0e0b0a. Реальный
                        <img> next/image лежит СВЕРХУ (порядок DOM) и, загрузившись,
                        полностью накрывает LQIP (тот же object-fit cover). */}
                    <img className="efs__lqip" src="data:image/webp;base64,UklGRlYBAABXRUJQVlA4IEoBAACwBgCdASoYACAAPt1apUyopSOiMAgBEBuJZACdMs8fHc0IH0YlTNYoCb5/rBc3DhidDyOF2JTSeUdkAWDEQAD+6+To90OmhVXZKtVq/HFJA7mgrOKOmR7D37uaHfsGD1Xt8ZtftnvC2SjMQUt4Zs9zneKMZ8xKTFMwldoByFETq2sFxaqDGV9Lcts1QKAgfJlfxLMoFZZf0GNqLuBUMTxxD8+XKBQPLMxyqwppmWS7WLezqJRtA18dkYXYsH1pdPzC/ZgvRfIWcVBA3QG0pS1buz2AYVPq7TILrGjQ2siWxYC5vLHEmIgJUv0ClcE7DeTsN69r9ETpEujidsrJMJ4asDG5S+LsaxNFyihQd0h6AeLgA5Ip1Lefkb/1UsaEhbUJJlaICege4O67eKEw9bVQHFMAtnB38vtHhbR7spxIsSriAzgWWblAAAA=" alt="" aria-hidden="true" decoding="async" />
                    <Image
                      src="/media/c67/founder-portrait-v6.webp"
                      alt="Дмитрий Нилов, основатель nilov catering, в фирменном фартуке на банкетной площадке"
                      fill
                      /* 480px = кап .efs__portrait-pos (≥1280) → DPR2 ровно 960
                         device-px (натив источника); бакет 1080 — ближайший в
                         дефолтном deviceSizes, не 1920 (FX10b). */
                      sizes="(max-width: 1023px) 92vw, 480px"
                      className="efs__portrait-img"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Карточка-сцена: внахлёст справа-снизу, белая рамка 4px.
                Вход: clip «шторка» слева→направо + rotate −10°→−5°, delay 0.4s
                после портрета. Hover (fine pointer): lift + выпрямление.
                Клип слит с карточкой (правка волны-1): clip-path режет в
                ЛОКАЛЬНЫХ координатах ДО transform — отдельная обёртка-клип
                точного размера срезала белую рамку rotate-нутой карточки со
                всех 4 сторон. «Шторка» теперь наклонена вместе с карточкой —
                приемлемо (угол карточки). §34: строки clip-path одной
                токен-структуры. */}
            <motion.div
              ref={sceneRef}
              className="efs__scene-pos"
              style={settled ? { y: sceneY } : undefined}
            >
              {/* Клип на ОБЁРТКЕ (не на карточке): clip-path режет и тень
                  карточки — обёртка имеет поле под тень (.efs__scene-clip).
                  §34: строки clip-path одной токен-структуры. */}
              <motion.div
                key={`sclip-${on}`}
                className="efs__scene-clip"
                {...(settled
                  ? {
                      initial: { clipPath: "inset(0% 100% 0% 0%)" },
                      animate:
                        sceneInView && sceneReady
                          ? { clipPath: "inset(0% 0% 0% 0%)" }
                          : undefined,
                      transition: { duration: narrow ? 0.85 : 1.0, delay: 0.4, ease: EASE },
                    }
                  : {})}
              >
                <motion.div
                  key={`scard-${on}`}
                  className="efs__scene-card"
                  {...(settled
                    ? {
                        initial: { rotate: -10 },
                        animate: sceneInView ? { rotate: -5 } : undefined,
                        // F6 (волна-A): hover-переход свой — короткий, без
                        // delay 0.4; входной transition (1.0s + delay) больше
                        // не наследуется жестом (hover отвечал через 250ms,
                        // доезжал ~1.85s).
                        whileHover: {
                          rotate: 0,
                          y: -6,
                          transition: { duration: 0.3, ease: "easeOut" },
                        },
                        // FX2 (волна-B): возврат из hover больше не ездит на
                        // входном delay 0.4 — после завершения входа
                        // (onAnimationComplete → sceneEntered) возврат
                        // 0.35s БЕЗ delay; самый первый вход — прежний
                        // (1.0s + 0.4s). whileHover-in по-прежнему 0.3s.
                        onAnimationComplete: () => setSceneEntered(true),
                        transition: sceneEntered
                          ? { duration: 0.35, ease: EASE }
                          : { duration: narrow ? 0.85 : 1.0, delay: 0.4, ease: EASE },
                      }
                    : {})}
                >
                <div className="efs__scene-frame">
                  {/* c91 (владелец: «вторую фотку основателя надо вернуть
                      которая была, просто сделать её без разводов») —
                      возвращён ИСХОДНЫЙ кадр c67 (Дмитрий у накрытого
                      стола, founder-scene-v4).
                      c93 (заказчик: «на маленькой фотке размытие
                      пикселей»): заплатки c91 (AI-перегенерация зон
                      разводов) давали мягкость стекла/клоша. v7 = v4 +
                      ДЕТЕРМИНИРОВАННАЯ чистка: вертикальные молочные
                      подтёки вычтены через горизонтальную медиану
                      (85% интенсивности, маска только по полосам,
                      фезеринг 3px) — зерно/резкость/лицо нетронуты
                      (замер лапласиана: бокалы 85 против 94 у v4 и
                      87 у v6; клош 80 против 87/73).
                      c117 (владелец: чёрный прямоугольник при загрузке +
                      качество): LQIP-подложка (как у портрета, см. выше) +
                      v8 = v7 + детерминированная ретушь дуэта (частичный
                      gray-world ББ, чёрная точка + S-кривая, лёгкий unsharp) —
                      цвет пары согласован (R−B: 37→20 против 41→21 у
                      портрета), лицо не тронуто (без AI-регенерации). */}
                  <img className="efs__lqip" src="data:image/webp;base64,UklGRnABAABXRUJQVlA4IGQBAABQBwCdASoYACAAPt1apUyopSOiMAgBEBuJYgCdMsvIqEBxAyqeBf02rh1uKsNFQsUuzA83DPyVWkbFoXpeP9aCMTZAAP7pXo/n/WbXKUpqfOnQcUks9tinzkP2B16DsJTNCK2EbikaYUAPf0piDa/yjDPqG9bU6uWURfoL5IsZZ40SV9frMmbh6usDhkucA1Ok3o9SXh5hiDmSKho31r2+biJ0SNTQuHPEceo5LICjd1t543q02YdGdJbJtJL/YZJd7bIOh57uboc7gWomP6/L3FLoZwUv6tSd4ZwzXSPZ/BR7E0Ck8r6zMu+7+1eyK+P3W9qm6yen5eBzYIQnSMWURjLafiPcHhqRmbPzMFAXCmF4NOlf+QhbXUFJJ+gMofR96eOqZD/DkSn18FAm+p8p9+sULOwUtrL8BLJF8J4i4i7J+XVHBXfyEzKvDofRqa7r/fY+6ENj/9fOYZM2XB2s8gAAAA==" alt="" aria-hidden="true" decoding="async" />
                  <Image
                    src="/media/c67/founder-scene-v8.webp"
                    alt="Дмитрий Нилов у накрытого банкетного стола — сервировка, зелень и свечи перед праздником"
                    fill
                    /* F9 (волна-A): 20vw при 1920 DPR2 просил w=828 против
                       достаточных 640 (слот карточки ~270px). Мобайл: 46vw
                       покрывает слот карточки (46% ширины media) с запасом. */
                    sizes="(max-width: 1023px) 46vw, 270px"
                    className="efs__scene-img"
                  />
                </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* — — ПРАВАЯ: хроника одних рук — — */}
          <div className="efs__body">
            {/* c85 (понятность): глава 03 (c89: была 06 до снятия
                CepProcess с рендера) — единая нумерация главных глав
                страницы (см. .ea-chapter в globals.css). Decorative. */}
            <span className="ea-chapter" aria-hidden="true">Глава 03</span>
            <motion.span
              key={`eyebrow-${on}`}
              className="ea-eyebrow efs__eyebrow"
              {...fadeUp(0)}
            >
              {/* c103: новый надзаголовок из ТЗ (CSS upper-case);
                  прежний — «Основатель · Наша история». */}
              Основатель и бренд-шеф
            </motion.span>

            <motion.h2
              key={`h2-${on}`}
              id="ea-founder-story-headline"
              /* c105: kinetic-h2 СНЯТ — wght-анимация 400→700 оседала
                  в Bold 700, и на фоне всех секций сайта (weight 400:
                  services/menu/booking/events/calculator) заголовок
                  читался «другим шрифтом» (жалоба владельца: «как будто
                  вообще другие шрифты»). Канон .ea-section-h2 = 400. */
              className="efs__h2"
              {...fadeUp(0.08)}
            >
              {/* c103: новый заголовок из ТЗ владельца; курсивный
                  акцент <i> (EA-идиома — как раньше «ваш») — на ключевой
                  фразе «безупречно всё». */}
              Кейтеринг с ресторанной дисциплиной: когда <i>безупречно всё</i>, от первого канапе до тайминга подачи
            </motion.h2>

            {/* Красный hairline 64×2 — EA signature. */}
            <motion.span
              key={`rule-${on}`}
              className="ea-divider-red efs__divider"
              aria-hidden="true"
              {...fadeUp(0.16)}
            />

            {/* Три минимальные главы — тезисно, воздух, stagger 100ms. */}
            <div className="efs__chapters">
              {CHAPTERS.map((chapter, i) => (
                <motion.div
                  key={`ch-${i}-${on}`}
                  className="efs__chapter"
                  {...fadeUp(0.22 + i * 0.1)}
                >
                  <h3 className="efs__chapter-label">{chapter.label}</h3>
                  <p className="efs__chapter-text">{chapter.text}</p>
                </motion.div>
              ))}
            </div>

            {/* c86-C: личная строка основателя — на месте прежней строки
                статистики (цифры удалены по указанию владельца: числа
                стареют). Ритм секции сохранён: тот же fadeUp-слот, отступ
                сверху равен прежнему, дальше — родной отступ .efs__sign-block.
                Типографика — display-курсив editorial-цитаты; контраст
                cream на ink ≈17:1 (как у H2, замер c67). */}
            <motion.p
              key={`quote-${on}`}
              className="efs__quote"
              {...fadeUp(0.4)}
              style={{
                margin: "4.25rem 0 0",
                maxWidth: "34rem",
                fontFamily: "var(--ea-font-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.25rem, 1.7vw, 1.5625rem)",
                lineHeight: 1.4,
                color: "var(--efs-cream)",
              }}
            >
              {/* c103: новая цитата владельца — про риски выездного
                  события и «премьерную» подготовку каждого выезда. */}
              «Выездное событие не прощает ошибок: здесь нет кухни за
              стеной, куда можно спрятаться. Поэтому каждый выезд мы готовим
              как премьеру, где идеальный вкус поддержан безупречной
              логистикой»
            </motion.p>

            {/* Подпись «чернильным письмом»: clip слева→направо 900ms после
                глав; под ней caps-роль. */}
            <div ref={signRef} className="efs__sign-block">
              {/* C77: личная печать шефа — НАСТОЯЩИЙ логотип компании над
                  подписью (растр emblem-white-480: белые буквы + золотые
                  кольца на прозрачном — вариант лого для тёмного фона),
                  наклон +4° (в противоход рукописному −2°): как hanko-печать
                  под росчерком. fadeUp — framer (transform на обёртке),
                  CSS-наклон — на внутреннем img (не конфликтуют). */}
              <motion.div className="efs__seal" {...fadeUp(0.48)}>
                <img
                  src="/brand/emblem-white-480.png"
                  alt=""
                  width={480}
                  height={558}
                  loading="lazy"
                  decoding="async"
                  className="efs__seal-badge"
                />
              </motion.div>
              <motion.div
                key={`sign-${on}`}
                className="efs__sign-clip"
                {...(settled
                  ? {
                      initial: { clipPath: "inset(0% 100% 0% 0%)" },
                      animate: signInView
                        ? { clipPath: "inset(0% 0% 0% 0%)" }
                        : undefined,
                      transition: { duration: 0.9, delay: 0.15, ease: EASE },
                    }
                  : {})}
              >
                <span className="efs__sign">Дмитрий Нилов</span>
              </motion.div>
              {/* Роль — из подписи ТЗ c103: «Дмитрий Нилов · Бренд-шеф и
                  основатель Nilov Catering» (имя — строкой выше в .efs__sign,
                  здесь — роль; надзаголовок дублирует «Основатель и
                  бренд-шеф», дубль снят по канону прошлых циклов). */}
              <motion.p key={`role-${on}`} className="efs__sign-role" {...fadeUp(0.4)}>
                Бренд-шеф и основатель Nilov Catering
              </motion.p>
            </div>

            {/* CTA — ea-text-link + SVG-стрелка (канон), scrollToMenu с
                lenis-фоллбеком (§33). <a href="#menu"> вместо button:
                без JS работает нативный якорь, с JS — preventDefault +
                плавный ретаргет-скролл (правка волны-1). */}
            <motion.div key={`cta-${on}`} className="efs__cta" {...fadeUp(0.45)}>
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToMenu();
                }}
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights).
                    motion-обёртка анимирует РОДИТЕЛЯ (fadeUp) — сам <a>
                    без inline-трансформа, конфликтов нет. */
                data-press
                className="ea-text-link"
              >
                Смотреть меню и тарифы
                <svg
                  className="ea-text-link__arrow"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12h14M14 6l6 6-6 6" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CSS-only зерно поверх всей сцены (opacity 0.055, без JS) — FX10a. */}
      <div className="efs__grain" aria-hidden="true" />
    </section>
  );
}

export default EaFounderStory;
